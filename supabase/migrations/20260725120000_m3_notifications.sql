-- BIT-26: In-app notifications (bell + policy-update alerts) — Module 3 / Policy & Contract
-- A persistent, push-style event feed to complement M3.2's live re-ack banner.
-- M3.2's banner is *derived* ("active versions minus my acks") and enforces an
-- outstanding signature; this table is a *stored* record that something changed,
-- surfaced by the employee-shell bell. When `publish_policy_version` /
-- `create_policy` (BIT-21) land a newly-active `policy_versions` row, a trigger
-- fans one notification out to every active employee, deep-linking to /policies.
--
-- The table is generic (`type` + `link`) so later producers — approval
-- decisions, contract uploads — reuse the same table and bell with no schema
-- change; only a new trigger/producer is added.
--
-- Divergences from the BIT-26 ticket text, made to fit this project as it
-- actually exists:
--   * RLS references public.is_admin(); the `auth` schema is reserved on this
--     project (BIT-3), so there is no auth.is_admin(). Same divergence as
--     BIT-21/BIT-22/BIT-23.
--   * The fan-out trigger fires on ANY newly-active version, so creating a brand
--     new policy (create_policy inserts version 1 with is_active = true) notifies
--     everyone too — not only re-publishes. This matches M3.2's banner, which
--     already flags a brand-new policy as owing a first acknowledgment, so the
--     bell and the banner stay in lock-step. `is_active` is the single condition.
--   * Recipients are matched by employees.id = auth.uid() (this project's
--     employees row IS the auth user — BIT-3), which is what lets the RLS
--     `recipient_id = auth.uid()` self-scope work without a join.

-- ---------------------------------------------------------------------------
-- 1. notifications — one row per recipient per event. Rows are created by
--    triggers / service-role producers only; there is deliberately no client
--    insert path (see RLS below), so a client can't spam another user's feed.
-- ---------------------------------------------------------------------------
create table notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references employees(id) on delete cascade,
  type          text not null,             -- 'policy_updated' (extensible)
  title         text not null,
  body          text,
  link          text,                      -- in-app route, e.g. '/policies'
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- Covers both the unread-count (recipient_id + read_at is null) and the feed
-- (recipient_id, newest first) access paths.
create index notifications_recipient_read_idx
  on notifications (recipient_id, read_at);

-- ---------------------------------------------------------------------------
-- 2. RLS
--    A recipient reads and marks-read only their own rows; an admin may read
--    everyone's (support). There is NO insert or delete policy for anyone: with
--    RLS on and no permissive insert policy, every non-owner role is denied
--    INSERT, so notifications can only originate from the security-definer
--    producers below — the whole point of the design.
-- ---------------------------------------------------------------------------
alter table notifications enable row level security;

create policy notif_select_own
on notifications
for select
to authenticated
using (recipient_id = auth.uid());

-- Admins may read all rows (optional, for support). Kept SELECT-only — an admin
-- has no reason to mark-read on someone else's behalf.
create policy notif_select_admin
on notifications
for select
to authenticated
using (public.is_admin());

-- Mark-read is the only write a client may perform, and only on its own rows.
-- The `with check` re-pins recipient_id = auth.uid() so an update can't move a
-- row to another recipient; the action only ever writes read_at.
create policy notif_update_own
on notifications
for update
to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Fan-out: a newly-activated policy version notifies every active employee.
--    Runs AFTER INSERT on policy_versions inside the same transaction as the
--    publish/create RPC. `security definer` so the insert bypasses the (absent)
--    client insert policy; inactive/terminated employees are excluded.
-- ---------------------------------------------------------------------------
create or replace function trg_notify_policy_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
begin
  if new.is_active then
    select 'Policy updated: ' || p.title
      into v_title
      from policies p
     where p.id = new.policy_id;

    insert into notifications (recipient_id, type, title, body, link)
    select e.id,
           'policy_updated',
           coalesce(v_title, 'A policy was updated'),
           'A new version was published. Please review and acknowledge.',
           '/policies'
      from employees e
     where e.account_status = 'active';
  end if;

  return new;
end;
$$;

create trigger notify_policy_update
after insert on policy_versions
for each row execute function trg_notify_policy_update();

-- A trigger function is never a client RPC. It stays `security definer` (so a
-- direct admin insert into policy_versions still fans out despite there being no
-- insert policy on notifications), but its default EXECUTE grant is revoked so
-- PostgREST can't expose it at /rest/v1/rpc — trigger execution doesn't check
-- the caller's EXECUTE privilege, so the fan-out is unaffected. Clears the
-- `*_security_definer_function_executable` advisor.
revoke execute on function trg_notify_policy_update() from public, anon, authenticated;
