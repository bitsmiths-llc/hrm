-- BIT-7: accept_onboarding() — a signed-in invited user accepting their invite
-- advances their own employees row from 'invited' to 'onboarding'. Keyed on the
-- JWT email so it works whether the identity arrived via password or Google
-- (auth.uid() may differ from employees.id for a freshly-linked OAuth identity).
--
-- guard_employee_columns() (BIT-3) blocks EVERY non-admin from changing
-- account_status — and a SECURITY DEFINER function still trips it because
-- is_admin() reads the caller's JWT, not the DB role. So this migration also
-- teaches the guard to honour a transaction-local bypass flag that only
-- accept_onboarding sets. Plain PostgREST UPDATEs cannot set the flag, so the
-- guard stays fully closed to direct client writes.

-- 1. Re-create the guard with a txn-local bypass escape hatch (search_path ''
--    preserved from 20260706112923_bit3_harden_functions.sql).
create or replace function public.guard_employee_columns() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not public.is_admin()
     and coalesce(current_setting('app.bypass_employee_guard', true), '') <> 'on' then
    if new.role is distinct from old.role
    or new.account_status is distinct from old.account_status then
      raise exception 'Not allowed to modify protected columns';
    end if;
  end if;
  return new;
end $$;

-- 2. accept_onboarding(): advance the caller's own invited row to onboarding.
create or replace function public.accept_onboarding() returns void
language plpgsql security definer set search_path = '' as $$
begin
  -- transaction-local; unset for any other statement in the request.
  perform set_config('app.bypass_employee_guard', 'on', true);
  update public.employees
     set account_status = 'onboarding',
         accepted_at    = coalesce(accepted_at, now())
   where email = (auth.jwt() ->> 'email')
     and account_status = 'invited';
end $$;

-- 3. Only signed-in users may call it; it operates strictly on their own row.
revoke execute on function public.accept_onboarding() from public, anon;
grant execute on function public.accept_onboarding() to authenticated;
