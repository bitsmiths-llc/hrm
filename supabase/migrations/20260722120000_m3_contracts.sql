-- BIT-22: Contracts — Module 3 / Policy & Contract
-- One contract per employee (PRD §6.2), uploaded manually as a signed PDF by an
-- admin. Append-only `contracts` with the same single-active-version shape as
-- `policy_versions` (BIT-21), but scoped per employee and backed by a private
-- `contracts` bucket instead of inline HTML. Replacing a contract never edits a
-- prior row: `upload_contract` inserts the next version and flips the old one
-- inactive, so superseded contracts stay downloadable from admin history.
--
-- Divergences from the BIT-22 ticket text, made to fit this project as it
-- actually exists:
--   * RLS/guards reference public.is_admin(); the `auth` schema is reserved on
--     this project (BIT-3), so there is no auth.is_admin().
--   * The object key is '<employee_id>/<uuid>.pdf', NOT '<employee_id>/<version>.pdf'.
--     The version is assigned by this RPC, but the file must be uploaded before
--     the RPC runs (so a failed upload inserts no row — an acceptance
--     criterion). The version therefore cannot be known at upload time without
--     racing a concurrent upload for the same employee. A UUID key is collision
--     free, keeps the employee id as the first path segment (which is all the
--     storage RLS below depends on), and the authoritative path is stored on
--     the row. `unique (storage_path)` stops one object backing two versions.
--   * `contract_select_own` is restricted to the ACTIVE row. The ticket scopes
--     it to `employee_id = auth.uid()`, which would also expose superseded
--     versions to any employee querying the table directly. The acceptance
--     criterion is "employee sees only their own active contract — no history",
--     so the predicate enforces it in the database rather than relying on the
--     employee UI to filter. Admins keep full history via `contracts_admin_all`.
--   * `file_name` and `note` columns are added (not in the ticket schema). The
--     admin upload dialog already collects an optional note ("Annual renewal")
--     and the version list renders the original filename — the UUID object key
--     carries neither.
--   * A partial unique index enforces the single-active-version invariant at
--     the schema level, matching the BIT-21 treatment: the RPC deactivates
--     before inserting, so a legitimate upload never trips it, but a stray
--     direct write can't silently leave two active contracts.
--   * `uploaded_by` is taken from auth.uid() inside the RPC rather than passed
--     in by the caller — a client-supplied uploader id is unverifiable.

-- ---------------------------------------------------------------------------
-- 1. contracts — append-only, one active row per employee.
-- ---------------------------------------------------------------------------
create table contracts (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references employees(id) on delete cascade,
  version       int not null check (version > 0),
  -- 'contracts' bucket key, '<employee_id>/<uuid>.pdf'. The first path segment
  -- is what the storage policies below match on, so it must stay the owner.
  storage_path  text not null unique,
  -- Original upload filename, for display/download only.
  file_name     text not null,
  -- Optional admin annotation, e.g. 'Annual renewal'.
  note          text,
  is_active     boolean not null default true,
  uploaded_by   uuid references employees(id) on delete set null,
  uploaded_at   timestamptz not null default now(),
  unique (employee_id, version)
);

-- The single-active-contract invariant, enforced by the database rather than
-- only by convention. See the header note.
create unique index contracts_one_active_idx
  on contracts (employee_id) where is_active;

-- Admin history reads every version for one employee, newest first.
create index contracts_employee_version_idx
  on contracts (employee_id, version desc);

-- ---------------------------------------------------------------------------
-- 2. RLS
--    A contract is personal: unlike policies (readable by every authenticated
--    user), an employee reads only their own active row and has no write path
--    at all. Admins do everything, in practice only through the RPC below.
-- ---------------------------------------------------------------------------
alter table contracts enable row level security;

create policy contracts_select_own
on contracts
for select
to authenticated
using (employee_id = auth.uid() and is_active);

create policy contracts_admin_all
on contracts
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. upload_contract — the atomic per-employee version flip.
--    Application code never sets `version` or `is_active` itself: this computes
--    the next version and deactivates the previous active row inside one
--    transaction. The `for update` lock on the parent employees row serializes
--    concurrent uploads so two of them can't compute the same next version.
--    The PDF is already in the bucket by the time this runs — a failed upload
--    never reaches here, so no row can point at a missing object.
-- ---------------------------------------------------------------------------
create or replace function upload_contract(
  p_employee_id uuid,
  p_storage_path text,
  p_file_name text,
  p_note text default null
)
returns contracts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next     int;
  v_uploader uuid;
  v_row      contracts;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  perform 1 from employees where id = p_employee_id for update;
  if not found then
    raise exception 'employee not found' using errcode = 'P0002';
  end if;

  -- Every admin on this project has an employees row, but the lookup keeps the
  -- FK safe for one that doesn't (attribution is nulled, the upload succeeds).
  select id into v_uploader from employees where id = auth.uid();

  select coalesce(max(version), 0) + 1 into v_next
    from contracts where employee_id = p_employee_id;

  update contracts
     set is_active = false
   where employee_id = p_employee_id and is_active;

  insert into contracts (
    employee_id, version, storage_path, file_name, note, is_active, uploaded_by
  )
  values (
    p_employee_id, v_next, p_storage_path, p_file_name,
    nullif(btrim(p_note), ''), true, v_uploader
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function upload_contract(uuid, text, text, text) from public, anon;
grant execute on function upload_contract(uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. contracts bucket — private, PDF only, 10MB (same ceiling as
--    medical-proofs). Always served through a short-lived signed URL.
--    Object keys are '<employee_id>/<uuid>.pdf', so the owner policy matches on
--    the first path segment exactly as medproofs_own does. Note the asymmetry:
--    the owner policy is SELECT only — an employee can read their own contract
--    but has no upload path. Admins upload into any employee's folder.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'contracts',
  'contracts',
  false,
  10485760,  -- 10 MB
  array['application/pdf']
)
on conflict (id) do nothing;

create policy contractdocs_own
on storage.objects
for select
using (
  bucket_id = 'contracts'
  and (storage.foldername(name))[1] = (auth.uid())::text
);

create policy contractdocs_admin
on storage.objects
for all
using (bucket_id = 'contracts' and public.is_admin())
with check (bucket_id = 'contracts' and public.is_admin());
