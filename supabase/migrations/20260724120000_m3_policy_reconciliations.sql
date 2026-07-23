-- BIT-25: Policy-to-module linkage & drift flag — Module 3 / Policy & Contract
-- The slug→enforced-rule MAP is app-level (src/constants/policy-links.ts); the
-- only thing persisted here is a lightweight reconciliation MARKER — which active
-- version of each policy an admin has last "reviewed" against the rule it
-- governs. Drift is a pure version comparison: a policy's current active
-- `policy_versions.id` differs from the one recorded here (see usePolicyLinkage).
--
-- Flag-only, never auto-mutate. Reconciling advances the marker; it never touches
-- `payroll_settings`. Adjusting an enforced number stays a separate, human step
-- (M2.4). This is the PRD §6.5 open-question resolution: flag drift, reconcile
-- manually.
--
-- Divergences from the BIT-25 ticket text, to fit this project as it exists:
--   * RLS references public.is_admin(); the `auth` schema is reserved on this
--     project (BIT-3), so there is no auth.is_admin(). Same as m3_policies.
--   * The reconcile read policy is `to authenticated using (true)`, matching the
--     `policies` / `policy_versions` select policies rather than an inline
--     `auth.role()` check — the panel that reads it is admin-only in practice.
--   * A baseline marker is seeded for every policy's current active version, so a
--     freshly-installed library shows no drift until a NEW version is published
--     (the "publishing raises the badge" acceptance criterion). `reconciled_by`
--     is left null on these system-seeded rows.

-- ---------------------------------------------------------------------------
-- 1. policy_reconciliations — one marker row per policy (policy_id is the PK, so
--    the single-row-per-policy invariant is the primary key itself). Points at
--    the version the admin confirmed still matches the enforced rule.
-- ---------------------------------------------------------------------------
create table policy_reconciliations (
  policy_id             uuid primary key references policies(id) on delete cascade,
  reconciled_version_id uuid not null references policy_versions(id),
  reconciled_by         uuid references employees(id),
  reconciled_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. RLS
--    Any authenticated user may read the marker (the linkage panel that consumes
--    it is admin-only by mount); only admins write, and in practice only through
--    the `markPolicyReviewed` action / `public.is_admin()`-guarded policy.
-- ---------------------------------------------------------------------------
alter table policy_reconciliations enable row level security;

create policy policy_reconciliations_select_authenticated
on policy_reconciliations
for select
to authenticated
using (true);

create policy policy_reconciliations_admin_all
on policy_reconciliations
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Seed a baseline marker at the current active version of every policy, so
--    the initial library reads as "reviewed" and only a subsequently published
--    version raises drift. `on conflict do nothing` keeps re-runs idempotent.
-- ---------------------------------------------------------------------------
insert into policy_reconciliations (policy_id, reconciled_version_id)
select pv.policy_id, pv.id
from policy_versions pv
where pv.is_active
on conflict (policy_id) do nothing;
