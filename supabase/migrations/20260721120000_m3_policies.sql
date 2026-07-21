-- BIT-21: Policy repository & versioning — Module 3 / Policy & Contract
-- Adds `policies` + append-only `policy_versions` (CKEditor HTML, no bucket, no
-- PDF), RLS, and the two RPCs every write goes through. Publishing never edits a
-- prior row: it inserts the next version and flips the old one inactive, so past
-- bodies are retained verbatim for audit.
--
-- Divergences from the BIT-21 ticket text, made to fit this project as it
-- actually exists:
--   * RLS/guards reference public.is_admin(); the `auth` schema is reserved on
--     this project (BIT-3), so there is no auth.is_admin().
--   * `policies.category` is kept alongside `slug`. The app already ships a
--     policy category (leave/medical/overtime/general) that the admin and
--     employee lists render; `slug` is added as the stable join key M3.5
--     (BIT-25) maps to an enforced rule.
--   * A partial unique index enforces the single-active-version invariant at
--     the schema level. The ticket says the invariant holds "only because"
--     every write goes through the RPC — that is true of the app, but the index
--     makes it true of the database, so a stray direct write can't silently
--     leave two active versions. The RPC deactivates before inserting, so the
--     per-statement index check never trips on a legitimate publish.
--   * `create_policy` (below) is a second RPC, not a plain insert. The admin
--     authors title + body in one sheet, so the policy row and its version 1
--     must land in the same transaction — a plain insert would leave an orphan
--     policy with no versions if the follow-up publish failed.
--   * `slug` is `not null` with a kebab-case check constraint (the ticket has it
--     nullable). It's a join key; a null one is never useful, and the check
--     backstops the Zod rule.
--   * Acknowledgments are NOT created here — they are BIT-23 (M3.2).
--
-- The HTML in `body_html` is sanitized by the server action (`sanitizeHtml`)
-- BEFORE it reaches these RPCs; the database stores whatever it is handed.

-- ---------------------------------------------------------------------------
-- 1. policies — one row per company policy document.
--    `slug` is the stable, human-readable identity used to tie a policy to the
--    system rule it governs (BIT-25); the title can be reworded without
--    breaking that mapping.
-- ---------------------------------------------------------------------------
create type policy_category as enum ('leave', 'medical', 'overtime', 'general');

create table policies (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique
                check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  category    policy_category not null default 'general',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_policies_updated
before update on policies
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. policy_versions — append-only history. One row per publish; the body is
--    sanitized CKEditor HTML rather than a file reference, so employees read
--    the policy in-app and a diff against an earlier version can highlight
--    exactly what changed.
-- ---------------------------------------------------------------------------
create table policy_versions (
  id            uuid primary key default gen_random_uuid(),
  policy_id     uuid not null references policies(id) on delete cascade,
  version       int not null check (version > 0),
  body_html     text not null,
  is_active     boolean not null default true,
  published_at  timestamptz not null default now(),
  unique (policy_id, version)
);

-- The single-active-version invariant, enforced by the database rather than
-- only by convention. See the header note.
create unique index policy_versions_one_active_idx
  on policy_versions (policy_id) where is_active;

-- The employee list reads every active version in one shot.
create index policy_versions_active_idx
  on policy_versions (published_at desc) where is_active;

-- ---------------------------------------------------------------------------
-- 3. RLS
--    Any authenticated user reads policies and their versions (the employee
--    view renders the active one; the admin editor walks the history). Only
--    admins write, and in practice only through the RPCs below.
-- ---------------------------------------------------------------------------
alter table policies enable row level security;
alter table policy_versions enable row level security;

create policy policies_select_authenticated
on policies
for select
to authenticated
using (true);

create policy policies_admin_all
on policies
for all
using (public.is_admin())
with check (public.is_admin());

create policy policy_versions_select_authenticated
on policy_versions
for select
to authenticated
using (true);

create policy policy_versions_admin_all
on policy_versions
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. publish_policy_version — the atomic version flip.
--    Application code never sets `version` or `is_active` itself: this computes
--    the next version number and deactivates the previous active row inside one
--    transaction. The `for update` lock on the parent policies row serializes
--    concurrent publishes so two of them can't compute the same next version.
-- ---------------------------------------------------------------------------
create or replace function publish_policy_version(
  p_policy_id uuid,
  p_body_html text
)
returns policy_versions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next int;
  v_row  policy_versions;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  perform 1 from policies where id = p_policy_id for update;
  if not found then
    raise exception 'policy not found' using errcode = 'P0002';
  end if;

  select coalesce(max(version), 0) + 1 into v_next
    from policy_versions where policy_id = p_policy_id;

  update policy_versions
     set is_active = false
   where policy_id = p_policy_id and is_active;

  insert into policy_versions (policy_id, version, body_html, is_active)
  values (p_policy_id, v_next, p_body_html, true)
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function publish_policy_version(uuid, text) from public, anon;
grant execute on function publish_policy_version(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. create_policy — the policy row and its version 1, in one transaction.
--    A duplicate slug raises 23505, which the action maps to a friendly
--    field-level error rather than a 500.
-- ---------------------------------------------------------------------------
create or replace function create_policy(
  p_title text,
  p_slug text,
  p_category policy_category,
  p_body_html text
)
returns policies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row policies;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into policies (title, slug, category)
  values (p_title, p_slug, p_category)
  returning * into v_row;

  insert into policy_versions (policy_id, version, body_html, is_active)
  values (v_row.id, 1, p_body_html, true);

  return v_row;
end;
$$;

revoke all on function create_policy(text, text, policy_category, text) from public, anon;
grant execute on function create_policy(text, text, policy_category, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Seed the starting policy library — the four documents the app previously
--    carried as mock data, so the repository isn't empty on first load. Same
--    approach as the `projects` seed in the overtime migration. The Leave
--    Policy ships with two versions (20 → 22 day pool) so version history and
--    the active-version flip have something real to show.
-- ---------------------------------------------------------------------------
with seeded as (
  insert into policies (title, slug, category) values
    ('Leave Policy',              'leave-policy',    'leave'),
    ('Medical Allowance Policy',  'medical-policy',  'medical'),
    ('Overtime Policy',           'overtime-policy', 'overtime'),
    ('Code of Conduct',           'code-of-conduct', 'general')
  returning id, slug
)
insert into policy_versions (policy_id, version, body_html, is_active, published_at)
select
  seeded.id,
  seed.version,
  seed.body_html,
  seed.is_active,
  seed.published_at
from seeded
join (
  values
    ('leave-policy', 1, false, timestamptz '2026-01-01', $html$<h2>Leave Policy</h2><p>All full-time and part-time employees draw from a single shared pool of <strong>20 days per year</strong>, covering Paid Leave, Sick Leave, and Half Day leave. A Half Day consumes 0.5 days from the pool.</p><p>Unpaid Leave is separate from the pool — it isn't capped, but every Unpaid Leave request is individually reviewed and approved by an admin, and reduces that pay period's salary proportionally.</p><h3>Requesting leave</h3><ul><li>Submit a request with the leave type, dates, and a reason.</li><li>No leave is auto-approved — every request requires explicit admin action.</li><li>The pool resets at the start of each calendar year.</li></ul>$html$),
    ('leave-policy', 2, true, timestamptz '2026-06-01', $html$<h2>Leave Policy</h2><p>All full-time and part-time employees draw from a single shared pool of <strong>22 days per year</strong>, covering Paid Leave, Sick Leave, and Half Day leave. A Half Day consumes 0.5 days from the pool.</p><p>Unpaid Leave is separate from the pool — it isn't capped, but every Unpaid Leave request is individually reviewed and approved by an admin, and reduces that pay period's salary proportionally.</p><h3>Requesting leave</h3><ul><li>Submit a request with the leave type, dates, and a reason.</li><li>No leave is auto-approved — every request requires explicit admin action.</li><li>The pool resets at the start of each calendar year.</li></ul>$html$),
    ('medical-policy', 1, true, timestamptz '2026-01-15', $html$<h2>Medical Allowance Policy</h2><p>Every eligible employee accrues <strong>5,000 PKR/month</strong> toward a shared medical allowance balance. Unused accrual rolls over month to month, up to a maximum balance of <strong>50,000 PKR</strong>.</p><p>The balance covers claims for the employee themselves, a parent, spouse, or child — it's one shared balance, not split per dependent.</p><h3>Submitting a claim</h3><ul><li>Provide who the claim is for, the service type, amount, and date of expense.</li><li>Attach proof (a prescription or receipt) — up to 5 files, 10MB each.</li><li>Approved claims deduct from the accrued balance and feed into that pay period's payroll.</li></ul><p>Employees on probation or in their notice period aren't eligible for medical allowance.</p>$html$),
    ('overtime-policy', 1, true, timestamptz '2026-03-10', $html$<h2>Overtime Policy</h2><p>Overtime pay applies to approved hours logged beyond an employee's standard working hours for the pay period.</p><p>Overtime Rate = Base Salary × Overtime Multiplier ÷ Working Hours. Overtime Pay = Overtime Rate × approved Overtime Hours.</p><p>The Overtime Multiplier is a global default set by admin, with an optional per-employee override applied at payroll-run time — it isn't visible to employees ahead of a payroll run.</p><h3>Logging overtime</h3><ul><li>Log the date, number of hours, project, and task.</li><li>Only approved hours are paid — every log requires explicit admin approval.</li></ul>$html$),
    ('code-of-conduct', 1, true, timestamptz '2026-06-25', $html$<h2>Code of Conduct</h2><p>This policy sets expectations for professional behavior, confidentiality, and communication at Bitsmiths.</p><h3>Confidentiality</h3><p>Employees must not share client data, source code, or internal business information outside the company without authorization.</p><h3>Communication</h3><p>All workplace communication — in person, on internal tools, or in writing — should remain respectful and professional. Harassment or discrimination of any kind will not be tolerated.</p><h3>Conflicts of interest</h3><p>Employees should disclose any outside work or financial interest that could reasonably conflict with their responsibilities at Bitsmiths.</p>$html$)
) as seed (slug, version, is_active, published_at, body_html)
  on seed.slug = seeded.slug;
