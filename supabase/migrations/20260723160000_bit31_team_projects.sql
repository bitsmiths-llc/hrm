-- BIT-31: Onboard employees — team directory + Projects first-class entity
-- Adds rich fields to `projects` (description, tech_stack, url) and enables
-- hard-delete of projects.  Also adds an RLS policy allowing admins to DELETE.
--
-- NOTE: The `description`, `tech_stack`, and `url` columns were already added
-- by the earlier migration 20260727120000_m4_projects_rich_fields.sql if it
-- ran in your environment. This migration is idempotent for those columns via
-- `IF NOT EXISTS` guards, so it is safe to run regardless.

-- ---------------------------------------------------------------------------
-- 1. Ensure the rich-field columns exist on `projects`
--    (m4_projects_rich_fields may have run already — guard with IF NOT EXISTS)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'projects'
      AND column_name  = 'description'
  ) THEN
    ALTER TABLE projects
      ADD COLUMN description TEXT NOT NULL DEFAULT '',
      ADD COLUMN tech_stack  TEXT[] NOT NULL DEFAULT '{}',
      ADD COLUMN url         TEXT;
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- 2. Allow admins to hard-delete projects.
--    The existing FK on overtime_logs (ON DELETE RESTRICT by default) prevents
--    deleting a project that has been referenced — Postgres returns 23503 and
--    the server action surfaces a friendly message instead.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'projects'
      AND policyname = 'projects_delete_admin'
  ) THEN
    CREATE POLICY projects_delete_admin
    ON projects
    FOR DELETE
    USING (public.is_admin());
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- 3. Back-fill the four seed projects with richer data so the employee-facing
--    Company → Projects tab and the onboarding welcome screen have something
--    meaningful to display from day one.
--    ON CONFLICT (name) DO UPDATE is idempotent — re-running is safe.
-- ---------------------------------------------------------------------------
INSERT INTO projects (name, description, tech_stack, url, is_active)
VALUES
  (
    'HRM Frontend',
    'The internal HR platform employees use for leave, payroll, policies, and more.',
    ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    'https://github.com/bitsmiths-llc/hrm',
    true
  ),
  (
    'Client API',
    'Backend services and integrations powering client deliverables.',
    ARRAY['Node.js', 'PostgreSQL', 'Prisma'],
    'https://github.com/bitsmiths-llc/client-api',
    true
  ),
  (
    'Design System',
    'Shared component library and design tokens used across all products.',
    ARRAY['React', 'Storybook', 'Radix UI'],
    'https://github.com/bitsmiths-llc/design-system',
    true
  ),
  (
    'Client Website Redesign',
    'Marketing site rebuild with the new brand direction.',
    ARRAY['Next.js', 'Framer Motion'],
    'https://bitsmiths.studio',
    false   -- inactive: exercises the accordion / toggle in settings
  )
ON CONFLICT (name) DO UPDATE
  SET description = EXCLUDED.description,
      tech_stack  = EXCLUDED.tech_stack,
      url         = EXCLUDED.url;
-- NOTE: is_active is intentionally NOT updated on conflict so admins can
-- toggle projects without the next deploy resetting the flag.
