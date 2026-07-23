'use server';

import { authActionClient } from '@/lib/server/safe-action';

import { updateSystemConfigSchema } from '@/schema/system-config';

/** Admin gate. Server-side even though the `sysconfig_write` RLS policy also
 *  enforces it — defense in depth, mirroring `actions/payroll.ts`. */
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

/**
 * Persist the app-wide module toggles to the `system_config` singleton (admin
 * only). Always updates the single `id = true` row. The flags drive nav
 * visibility app-wide, read back via `useSystemConfig()`.
 */
export const updateSystemConfig = authActionClient
  .schema(updateSystemConfigSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { error } = await supabase
      .from('system_config')
      .update({
        reimbursements_enabled: parsedInput.reimbursementsEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', true);
    if (error) throw new Error(error.message);

    return { success: true };
  });
