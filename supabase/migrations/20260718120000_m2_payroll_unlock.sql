-- ---------------------------------------------------------------------------
-- unlock_payroll(p_run_id) — transactional reverse of lock_payroll.
--   Full revert: releases the medical/OT this run swept (payroll_run_id → null,
--   so a future run can pick them up again), clears the frozen total_payroll and
--   the locked_by / locked_at stamps, and flips locked → open. Employees stop
--   seeing their payslips automatically (RLS payslip_own_locked requires the run
--   to be 'locked'). Admin-only (security definer, asserts is_admin(), 42501
--   otherwise). Refuses a run that isn't locked (55000). One plpgsql
--   transaction: a partial failure rolls the whole revert back.
--
--   Symmetric with lock_payroll: locking sweep-stamps approved medical/OT onto
--   the run; unlocking un-stamps exactly the rows carrying THIS run's id, so an
--   item is never left orphaned or double-counted across runs.
-- ---------------------------------------------------------------------------
create or replace function unlock_payroll(p_run_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run payroll_runs%rowtype;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_run from payroll_runs where id = p_run_id for update;
  if not found then raise exception 'run % not found', p_run_id; end if;
  if v_run.status <> 'locked' then
    raise exception 'run % is not locked', p_run_id using errcode = '55000';
  end if;

  -- Release the items this run swept back to the pool. Reverting only rows
  -- stamped with THIS run mirrors the lock sweep exactly.
  update overtime_logs set payroll_run_id = null where payroll_run_id = p_run_id;
  update medical_claims set payroll_run_id = null where payroll_run_id = p_run_id;

  update payroll_runs
     set status = 'open', total_payroll = null,
         locked_by = null, locked_at = null
   where id = p_run_id;
end;
$$;
revoke all on function unlock_payroll(uuid) from public, anon;
grant execute on function unlock_payroll(uuid) to authenticated;
