-- BIT-23: Acknowledgment & compliance — Module 3 / Policy & Contract
-- Per PRD §6.3 the onboarding consent is the first e-signature, and any policy
-- published *after* onboarding must prompt existing employees to re-acknowledge.
-- This adds one row per employee × policy *version* (never per policy), so a new
-- version published by `publish_policy_version` (BIT-21) automatically leaves
-- everyone unacknowledged against it — the re-ack prompt and the compliance
-- grid both fall out of that, with no cache to invalidate or flag to reset.
--
-- Divergences from the BIT-23 ticket text, made to fit this project as it
-- actually exists:
--   * RLS/guards reference public.is_admin(); the `auth` schema is reserved on
--     this project (BIT-3), so there is no auth.is_admin(). Same divergence as
--     BIT-21/BIT-22.
--   * The admin policy is SELECT-only (`ack_select_admin`), NOT the
--     `<table>_admin_all` shape the other M3 tables use. An acknowledgment is an
--     e-signature: an admin who could insert one would be signing on an
--     employee's behalf, which is exactly what the whole feature exists to
--     evidence. Admins read everything and write nothing here.
--   * There is deliberately NO update or delete policy for anyone. With RLS on
--     and no permissive policy for a command, that command is denied to every
--     non-owner role — so the table is append-only for admins and employees
--     alike, and an acknowledgment can't be quietly rewritten or withdrawn
--     after the fact. Rows still disappear via the `on delete cascade` when the
--     employee or the version itself is deleted.
--   * `policy_compliance()` also returns `version` and `acknowledged_at` (the
--     ticket returns neither). The admin grid names the version employees are
--     being measured against and shows the date next to each acknowledged
--     employee; both are already in hand at zero extra cost here, and deriving
--     them client-side would mean a second round trip per policy.
--   * `full_name` is coalesced to `email`. `employees.full_name` is nullable
--     (it's filled in during onboarding), and a compliance roster with blank
--     rows is unusable for chasing people.
--   * Employees whose `account_status` is not 'active' are excluded from the
--     denominator, matching the ticket. Admins ARE included: they hold
--     employees rows and are subject to company policy like anyone else.

-- ---------------------------------------------------------------------------
-- 1. policy_acknowledgments — append-only, one row per employee × version.
-- ---------------------------------------------------------------------------
create table policy_acknowledgments (
  id                 uuid primary key default gen_random_uuid(),
  employee_id        uuid not null references employees(id) on delete cascade,
  -- The *version*, not the policy: acknowledging v1 says nothing about v2, so
  -- compliance against the active version is a plain join with no date math.
  policy_version_id  uuid not null references policy_versions(id) on delete cascade,
  acknowledged_at    timestamptz not null default now(),
  -- Makes a repeat acknowledgment a 23505 rather than a duplicate row, which is
  -- what lets `acknowledgePolicy` be idempotent (it swallows exactly that code).
  unique (employee_id, policy_version_id)
);

-- The unique constraint already indexes (employee_id, policy_version_id), which
-- covers "what has this employee acknowledged". This covers the other
-- direction: policy_compliance() joins acks to each active version.
create index policy_acknowledgments_version_idx
  on policy_acknowledgments (policy_version_id);

-- ---------------------------------------------------------------------------
-- 2. RLS
--    An employee reads and creates only their own acknowledgments; an admin
--    reads all of them and creates none. Nobody updates or deletes — see the
--    header note on the missing policies being the point.
-- ---------------------------------------------------------------------------
alter table policy_acknowledgments enable row level security;

create policy ack_select_own
on policy_acknowledgments
for select
to authenticated
using (employee_id = auth.uid());

create policy ack_select_admin
on policy_acknowledgments
for select
to authenticated
using (public.is_admin());

-- Two independent guards, both required:
--   * `employee_id = auth.uid()` — a forged employee_id in the request payload
--     cannot acknowledge on someone else's behalf, even though the server
--     action already forces this field.
--   * the `exists` — only a CURRENTLY-ACTIVE version can be acknowledged.
--     Without it an employee could ack a superseded version and falsely satisfy
--     compliance. If a version is deactivated between page load and click, the
--     stale insert is rejected rather than silently recorded.
create policy ack_insert_own
on policy_acknowledgments
for insert
to authenticated
with check (
  employee_id = auth.uid()
  and exists (
    select 1
      from policy_versions pv
     where pv.id = policy_version_id
       and pv.is_active
  )
);

-- ---------------------------------------------------------------------------
-- 3. policy_compliance — the admin roster.
--    One row per active policy × active employee: has that employee
--    acknowledged the version that is active *right now*? A prior-version ack
--    deliberately does not count, which is what makes publishing an update drop
--    compliance until everyone re-acknowledges.
--
--    `security definer` because the roster spans every employee's ack rows,
--    which `ack_select_own` would otherwise hide from a caller reading them
--    directly — the in-function admin guard replaces that row filtering. M4's
--    compliance widget calls this same function; compliance math is not
--    reimplemented there.
-- ---------------------------------------------------------------------------
create or replace function policy_compliance()
returns table (
  policy_id          uuid,
  title              text,
  policy_version_id  uuid,
  version            int,
  employee_id        uuid,
  full_name          text,
  acknowledged       boolean,
  acknowledged_at    timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
    select p.id,
           p.title,
           pv.id,
           pv.version,
           e.id,
           coalesce(nullif(btrim(e.full_name), ''), e.email),
           (a.id is not null),
           a.acknowledged_at
      from policies p
      join policy_versions pv
        on pv.policy_id = p.id
       and pv.is_active
      cross join employees e
      left join policy_acknowledgments a
        on a.policy_version_id = pv.id
       and a.employee_id = e.id
     where e.account_status = 'active'
     order by p.title, coalesce(nullif(btrim(e.full_name), ''), e.email);
end;
$$;

revoke all on function policy_compliance() from public, anon;
grant execute on function policy_compliance() to authenticated;
