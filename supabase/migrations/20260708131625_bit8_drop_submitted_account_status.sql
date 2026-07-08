-- BIT-8: drop the unused 'submitted' account_status enum value.
-- BIT-3 created account_status as ('invited','onboarding','submitted','active'),
-- but the lifecycle is invited -> onboarding -> active with no review/submitted
-- state. Postgres can't DROP an enum value, so recreate the type without it and
-- swap the employees.account_status column over. Verified: zero rows use
-- 'submitted' and employees.account_status is the only column of this type.

alter type public.account_status rename to account_status__old;

create type public.account_status as enum ('invited', 'onboarding', 'active');

alter table public.employees
  alter column account_status drop default,
  alter column account_status type public.account_status
    using account_status::text::public.account_status,
  alter column account_status set default 'invited';

drop type public.account_status__old;
