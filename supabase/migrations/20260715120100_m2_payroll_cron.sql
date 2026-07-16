-- BIT-15 (cont.): pg_cron schedule for the monthly auto-created payroll run.
-- Split from 20260715120000_m2_payroll.sql so that if pg_cron is unavailable or
-- the schedule call fails, the load-bearing payroll migration (tables, RLS,
-- RPCs) is unaffected. Auto-create is convenience, not lifecycle: this only
-- *creates* an open run each month — calculating, locking and publishing stay
-- explicit admin actions. Because a fresh open run appears each month,
-- late-approved (never-swept) medical/OT rolls forward into it automatically.

create extension if not exists pg_cron;

-- 00:05 on the 1st of every month. Idempotent via unique(period_month), so this
-- firing and a manual "Create run" click for the same month never collide.
-- unschedule any prior definition first so re-running the migration is safe.
select cron.unschedule('payroll-monthly-run')
where exists (select 1 from cron.job where jobname = 'payroll-monthly-run');

select cron.schedule('payroll-monthly-run', '5 0 1 * *', $$ select ensure_current_run(); $$);
