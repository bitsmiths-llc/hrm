-- BIT-24: Onboarding email template (singleton) — Module 3 / Policy & Contract
-- One editable invitation email (subject + rich HTML body), reused for every
-- invite (PRD §6.4). The admin edits it in a CKEditor; the M1.3 invite flow
-- renders `{{onboarding_link}}` / `{{employee_name}}` from the saved row and
-- sends it. Employees never read this table — the rendered email is delivered
-- out-of-band by the invite action (service role), so RLS is admin-only.
--
-- Divergences from the BIT-24 ticket text, to fit this project as it exists
-- (same rationale as every other migration here):
--   * The ticket's SQL calls `auth.is_admin()`; the `auth` schema is reserved
--     on this project (BIT-3), so the policy uses `public.is_admin()`.
--   * `updated_by` gets `on delete set null` so removing the admin who last
--     edited the template never blocks deleting their employees row.
--   * The row is seeded once here (as postgres, bypassing RLS) and thereafter
--     only UPDATEd, so RLS needs no INSERT policy of its own. A set_updated_at
--     trigger keeps `updated_at` fresh on write (consistent with every other
--     table in this schema).

-- ---------------------------------------------------------------------------
-- Singleton table. `id boolean primary key check (id)` allows exactly one row
-- (id = true) — the same pattern as payroll_settings / system_config.
-- ---------------------------------------------------------------------------
create table onboarding_email_template (
  id         boolean primary key default true check (id),
  subject    text not null,
  body_html  text not null,
  updated_by uuid references employees(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Seed one default row so render never hits an empty table. The body carries
-- the mandatory {{onboarding_link}} token (Zod also enforces this at save time)
-- so an invite can never go out without a working onboarding link.
insert into onboarding_email_template (id, subject, body_html)
values (
  true,
  'You''re invited to join Bitsmiths HRM',
  '<p>Hi {{employee_name}},</p><p>You''ve been invited to join Bitsmiths HRM. Click the link below to set up your account and complete onboarding.</p><p><a href="{{onboarding_link}}">Accept your invitation</a></p>'
)
on conflict (id) do nothing;

create trigger trg_onboarding_email_template_updated
before update on onboarding_email_template
for each row execute function set_updated_at();

alter table onboarding_email_template enable row level security;

-- Admin-only for every operation; employees have no reason to read it.
create policy oet_admin
on onboarding_email_template
for all
using (public.is_admin())
with check (public.is_admin());
