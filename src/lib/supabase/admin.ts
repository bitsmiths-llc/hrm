import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { env } from '@/env';

import type { Database } from '@/types/supabase';

/**
 * Service-role Supabase client. Bypasses RLS — use only on the server for
 * privileged operations (admin invites, onboarding writes) where RLS cannot
 * express the required access. Never import this from a client component:
 * the `server-only` import above turns any client-side import into a build
 * error, keeping the service-role key out of the browser bundle.
 */
export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
