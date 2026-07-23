-- BIT-18: Unified approvals queue — one guarded read across the four pending
-- sources (leave, medical, overtime, onboarding) for the admin approvals page.
--
-- The page dispatches each row back to the module's *existing* review action
-- (reviewLeaveRequest / reviewMedicalClaim / reviewOvertimeLog / approveEmployee
-- + returnOnboarding) — this migration adds no new approve/reject logic, only the
-- read that unions the sources into one chronological queue.
--
-- Guard is mandatory: this reads every employee's request rows, which per-employee
-- RLS would forbid. `security definer` bypasses RLS, so the public.is_admin()
-- top-guard (42501) is the sole access control — the same convention as the M4
-- dashboard RPCs (dashboard_summary / employees_by_status). The `auth` schema is
-- reserved on this project (BIT-3), so the guard is public.is_admin(), never
-- auth.is_admin().

-- ---------------------------------------------------------------------------
-- pending_approvals() — union-normalized pending items across all four sources,
-- newest first (item_id breaks ties so a shared timestamp stays stable). Each
-- select projects to the common shape:
--   (kind, item_id, employee_id, employee_name, summary, amount, submitted_at)
-- `amount` is only meaningful for medical (whole PKR); the rest pass null.
-- `submitted_at` unifies each source's timestamp for chronological ordering —
-- onboarding has no dedicated submit column, so it falls back consent_at →
-- updated_at.
-- ---------------------------------------------------------------------------
create or replace function pending_approvals()
returns table (
  kind          text,
  item_id       uuid,
  employee_id   uuid,
  employee_name text,
  summary       text,
  amount        int,
  submitted_at  timestamptz
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

  -- The first select names the union's result columns; `order by submitted_at`
  -- across a UNION ALL only resolves against those names (not the RETURNS TABLE
  -- out-params), so the leading select must alias them explicitly.
  return query
    select
      'leave'::text                                                             as kind,
      lr.id                                                                     as item_id,
      lr.employee_id                                                            as employee_id,
      e.full_name                                                               as employee_name,
      initcap(replace(lr.leave_type::text, '_', ' ')) || ' · ' || trim_scale(lr.num_days)::text || 'd' as summary,
      null::int                                                                 as amount,
      lr.created_at                                                             as submitted_at
    from leave_requests lr
    join employees e on e.id = lr.employee_id
    where lr.status = 'pending'
  union all
    select
      'medical'::text,
      mc.id,
      mc.employee_id,
      e.full_name,
      initcap(replace(mc.service_type::text, '_', ' ')),
      mc.amount,
      mc.created_at
    from medical_claims mc
    join employees e on e.id = mc.employee_id
    where mc.status = 'pending'
  union all
    select
      'overtime'::text,
      ol.id,
      ol.employee_id,
      e.full_name,
      trim_scale(ol.hours)::text || 'h overtime',
      null::int,
      ol.created_at
    from overtime_logs ol
    join employees e on e.id = ol.employee_id
    where ol.status = 'pending'
  union all
    select
      'onboarding'::text,
      e.id,
      e.id,
      e.full_name,
      'Onboarding submitted'::text,
      null::int,
      coalesce(e.consent_at, e.updated_at)
    from employees e
    where e.account_status = 'submitted'
  order by submitted_at desc, item_id desc;
end;
$$;

revoke all on function pending_approvals() from public, anon;
grant execute on function pending_approvals() to authenticated;
