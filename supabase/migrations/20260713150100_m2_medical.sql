-- BIT-13: Medical (claims, files, balance, approvals) — Module 2 / Payroll
-- Adds the medical_for / service_type enums, the medical_claims +
-- medical_claim_files tables + RLS, the balance-bounding medical_balance() RPC,
-- and the private `medical-proofs` storage bucket + policies.
--
-- Divergences from the BIT-13 ticket text, made to fit this project as it
-- actually exists (see also the leave/BIT-12 migration):
--   * request_status already exists (created by m2_leave) — not recreated.
--   * service_type keeps the app's established 7-value set (types/hrm.ts,
--     hrm-labels.ts) rather than the ticket's illustrative 4 values.
--   * RLS references public.is_admin() / auth.uid(); the `auth` schema is
--     reserved on this project (BIT-3), so there is no auth.is_admin().
--   * Admin-notify-on-submit and the decision email are done in the server
--     actions (supabaseAdmin + Resend), mirroring leave/onboarding — this
--     project has no pg_net extension and no notify-admins Edge Function, so
--     there is deliberately NO pg_net trigger here.

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
create type medical_for as enum ('self', 'parent', 'spouse', 'child');

-- Eligible expense categories (Medical Allowance Policy §3). Kept in sync with
-- MedicalServiceType in src/types/hrm.ts and medicalServiceTypeLabels.
create type service_type as enum (
  'consultation',
  'hospitalization',
  'medication',
  'lab_diagnostics',
  'emergency',
  'dental',
  'vision'
);

-- ---------------------------------------------------------------------------
-- 2. medical_claims
--    amount is whole PKR (integer). rejection_reason is populated only when an
--    admin rejects (surfaced in the decision email + the employee's history).
--    payroll_run_id is a bare uuid for now; the FK to payroll_runs is wired in
--    a later payroll migration (do not reference payroll_runs here).
-- ---------------------------------------------------------------------------
create table medical_claims (
  id               uuid primary key default gen_random_uuid(),
  employee_id      uuid not null references employees(id) on delete cascade,
  claim_for        medical_for not null,
  service_type     service_type not null,
  description      text not null,
  amount           integer not null check (amount > 0),  -- whole PKR
  expense_date     date not null,
  status           request_status not null default 'pending',
  rejection_reason text,
  reviewed_by      uuid references employees(id),
  reviewed_at      timestamptz,
  payroll_run_id   uuid,                                  -- FK added in M2.4
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Supports both the approved-spend sum (employee_id + status) and the admin
-- pending queue, newest first by expense date.
create index medical_claims_employee_idx
  on medical_claims (employee_id, status, expense_date);

-- ---------------------------------------------------------------------------
-- 3. medical_claim_files
--    One row per uploaded proof. storage_path points into the `medical-proofs`
--    bucket at `<uid>/<claimId>/<file>`. No per-file employee_id: ownership is
--    inherited from the parent claim via the RLS subquery below.
-- ---------------------------------------------------------------------------
create table medical_claim_files (
  id           uuid primary key default gen_random_uuid(),
  claim_id     uuid not null references medical_claims(id) on delete cascade,
  storage_path text not null,
  file_name    text,
  uploaded_at  timestamptz not null default now()
);

create index medical_claim_files_claim_idx on medical_claim_files (claim_id);

-- ---------------------------------------------------------------------------
-- 4. updated_at trigger (reuses the shared set_updated_at() from BIT-3)
-- ---------------------------------------------------------------------------
create trigger trg_medical_updated
before update on medical_claims
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Server-side cap of 5 proof files per claim. The client (FileUpload) also
--    enforces this, and the bucket enforces the 10MB/type limit; this trigger
--    is the DB backstop that a bypassed client can't get around.
-- ---------------------------------------------------------------------------
create or replace function enforce_max_medical_files() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.medical_claim_files where claim_id = new.claim_id) >= 5 then
    raise exception 'A medical claim can have at most 5 proof files';
  end if;
  return new;
end $$;

create trigger trg_medical_files_max
before insert on medical_claim_files
for each row execute function enforce_max_medical_files();

-- Trigger function is invoked only by its trigger, never as a PostgREST RPC.
revoke execute on function public.enforce_max_medical_files() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. RLS
--    - employees read/insert only their own claims; the insert is pinned to
--      status = 'pending' so an employee can never self-approve.
--    - file rows/objects inherit claim ownership via the exists(...) subquery.
--    - admins do everything (public.is_admin() reads the JWT app_metadata.role).
-- ---------------------------------------------------------------------------
alter table medical_claims enable row level security;
alter table medical_claim_files enable row level security;

create policy medical_select_own
on medical_claims
for select
using (employee_id = auth.uid());

create policy medical_insert_own
on medical_claims
for insert
with check (employee_id = auth.uid() and status = 'pending');

create policy medical_admin_all
on medical_claims
for all
using (public.is_admin())
with check (public.is_admin());

create policy medfiles_own
on medical_claim_files
for all
using (
  exists (
    select 1 from medical_claims c
    where c.id = claim_id and c.employee_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from medical_claims c
    where c.id = claim_id and c.employee_id = auth.uid()
  )
);

create policy medfiles_admin
on medical_claim_files
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. medical_balance() — the single source of truth for the accrual pool.
--    SECURITY INVOKER (default) so the inner select is subject to RLS: an
--    employee resolves their own balance, an admin can resolve anyone's.
--    Never stored — derived on every read so it can't drift on a retroactive
--    approval/rejection. Accrual grows 5,000/month from activated_at (fallback
--    created_at), capped at 50,000; spend is the sum of *approved* claims only
--    (pending/rejected never move the balance). The 50000/5000 literals are the
--    bootstrap defaults; production replaces them with payroll_settings values
--    (M2.4), mirroring leave_balance()'s literal pool of 22.
--    search_path='' + public.-qualified tables satisfies linter 0011.
-- ---------------------------------------------------------------------------
create or replace function medical_balance(p_employee uuid)
returns table (accrued int, spent int, available int)
language sql
stable
set search_path = ''
as $$
  with joined as (
    select coalesce(activated_at, created_at) as start_at
    from public.employees
    where id = p_employee
  ),
  months as (
    select greatest(
      0,
      (extract(year  from age(now(), (select start_at from joined))) * 12
     + extract(month from age(now(), (select start_at from joined))))::int
    ) as m
  ),
  acc as (
    select least(50000, 5000 * (select m from months)) as accrued
  ),
  spend as (
    select coalesce(sum(amount), 0)::int as spent
    from public.medical_claims
    where employee_id = p_employee and status = 'approved'
  )
  select
    (select accrued from acc)::int,
    (select spent from spend)::int,
    greatest(0, (select accrued from acc) - (select spent from spend))::int
$$;

-- ---------------------------------------------------------------------------
-- 8. Private `medical-proofs` bucket + storage policies. Mirrors the
--    identity-docs bucket: owner = first path segment (<uid>/…), admin all.
--    The bucket enforces the 10MB size limit and the proof MIME allow-list
--    server-side, independent of the client.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medical-proofs',
  'medical-proofs',
  false,
  10485760,  -- 10 MB
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy medproofs_own
on storage.objects
for all
using (
  bucket_id = 'medical-proofs'
  and (storage.foldername(name))[1] = (auth.uid())::text
)
with check (
  bucket_id = 'medical-proofs'
  and (storage.foldername(name))[1] = (auth.uid())::text
);

create policy medproofs_admin
on storage.objects
for all
using (bucket_id = 'medical-proofs' and public.is_admin())
with check (bucket_id = 'medical-proofs' and public.is_admin());
