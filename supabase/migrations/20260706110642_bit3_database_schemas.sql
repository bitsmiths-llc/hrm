-- BIT-3: Database Schemas + Project Setup
-- Enums, core tables (employees, bank_details, socials, employment_details),
-- helper functions, triggers, and RLS policies for the Employee & Onboarding module.
--
-- NOTE ON is_admin(): the ticket specifies `auth.is_admin()`, but on this project
-- the `auth` schema is reserved — the migration role (postgres) lacks CREATE on it
-- (Postgres 17 / current Supabase default). The helper is therefore defined in
-- `public`. Behavior is identical: it reads the JWT `app_metadata.role`, stays
-- STABLE, and is cheap inside RLS USING clauses. App code never calls it directly
-- (middleware / authActionClient read app_metadata.role), so only the RLS policies
-- and the column guard reference it — all updated to `public.is_admin()`.

-- ---------------------------------------------------------------------------
-- 1-3. Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('admin', 'employee');
create type account_status as enum ('invited', 'onboarding', 'submitted', 'active');
create type employment_type as enum ('full_time', 'part_time');

-- ---------------------------------------------------------------------------
-- 4. set_updated_at() — stamps updated_at on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- 5. public.is_admin() — reads the JWT (not the table) so it stays cheap in RLS
--    USING clauses and cannot recurse into the employees policies it guards.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

-- ---------------------------------------------------------------------------
-- 6. employees
-- ---------------------------------------------------------------------------
create table employees (
  id                uuid primary key,
  role              user_role      not null default 'employee',
  account_status    account_status not null default 'invited',
  email             text           not null unique,
  invited_at        timestamptz,
  accepted_at       timestamptz,
  activated_at      timestamptz,
  consent_at        timestamptz,
  full_name         text,
  date_of_birth     date,
  phone             text,
  emergency_contact text,
  address           text,
  cnic              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 7. updated_at trigger
create trigger trg_employees_updated
before update on employees
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. mirror_role_to_jwt() — copies employees.role into
--    auth.users.raw_app_meta_data.role; folded into JWT app_metadata on the
--    next token refresh. This is the routing contract read by middleware and
--    authActionClient's admin guard.
-- ---------------------------------------------------------------------------
create or replace function mirror_role_to_jwt() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update auth.users
     set raw_app_meta_data =
         coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role::text)
   where id = new.id;
  return new;
end $$;

-- 9. role mirroring trigger
create trigger trg_employees_mirror_role
after insert or update of role on employees
for each row execute function mirror_role_to_jwt();

-- ---------------------------------------------------------------------------
-- 10. guard_employee_columns() — column-level guard complementary to RLS.
--     RLS decides which rows; this decides which columns within a permitted
--     row. A self-user passes employees_update_self but is still blocked from
--     changing role/account_status.
-- ---------------------------------------------------------------------------
create or replace function guard_employee_columns() returns trigger
language plpgsql as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role
    or new.account_status is distinct from old.account_status then
      raise exception 'Not allowed to modify protected columns';
    end if;
  end if;
  return new;
end $$;

-- 11. protected columns guard trigger
create trigger trg_employees_guard
before update on employees
for each row execute function guard_employee_columns();

-- 12. enable RLS
alter table employees enable row level security;

-- 13-17. employees policies
create policy employees_select_self
on employees
for select
using (id = auth.uid());

create policy employees_select_admin
on employees
for select
using (public.is_admin());

create policy employees_update_self
on employees
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy employees_update_admin
on employees
for update
using (public.is_admin())
with check (public.is_admin());

create policy employees_insert_admin
on employees
for insert
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 18. bank_details
-- ---------------------------------------------------------------------------
create table bank_details (
  employee_id uuid primary key references employees(id) on delete cascade,
  bank_name text,
  account_holder text,
  account_number text,
  iban text,
  bank_branch text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 19. updated_at trigger
create trigger trg_bank_updated
before update on bank_details
for each row execute function set_updated_at();

-- 20. enable RLS
alter table bank_details enable row level security;

-- 21-22. bank_details policies
create policy bank_own
on bank_details
for all
using (employee_id = auth.uid())
with check (employee_id = auth.uid());

create policy bank_admin
on bank_details
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 23. socials
-- ---------------------------------------------------------------------------
create table socials (
  employee_id uuid primary key references employees(id) on delete cascade,
  github_url text,
  linkedin_url text,
  twitter_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 24. updated_at trigger
create trigger trg_socials_updated
before update on socials
for each row execute function set_updated_at();

-- 25. enable RLS
alter table socials enable row level security;

-- 26-27. socials policies
create policy socials_own
on socials
for all
using (employee_id = auth.uid())
with check (employee_id = auth.uid());

create policy socials_admin
on socials
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 28. employment_details
-- ---------------------------------------------------------------------------
create table employment_details (
  employee_id uuid primary key references employees(id) on delete cascade,
  employment_type employment_type,
  base_salary integer,
  working_hours numeric(6, 2),
  designation text,
  department text,
  ot_multiplier_override numeric(4, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 29. updated_at trigger
create trigger trg_employment_updated
before update on employment_details
for each row execute function set_updated_at();

-- 30. enable RLS
alter table employment_details enable row level security;

-- 31-32. employment_details policies
create policy employment_read_own
on employment_details
for select
using (employee_id = auth.uid());

create policy employment_admin
on employment_details
for all
using (public.is_admin())
with check (public.is_admin());
