'use server';

import { authActionClient } from '@/lib/server/safe-action';

import { uploadContractSchema } from '@/schema/contract';

/** Admin gate. Server-side even though `public.is_admin()` guards the RPC and
 *  the `contracts_admin_all` RLS policy — defense in depth, mirroring
 *  `actions/policies.ts`. */
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

/**
 * Record an uploaded contract as the employee's next version (admin only).
 *
 * Never sets `version` or `is_active` itself: `upload_contract` computes the
 * next version, deactivates the previous active row, and inserts — all in one
 * transaction — so history stays append-only and exactly one contract per
 * employee is ever active.
 *
 * Runs on the caller's RLS-scoped client rather than the service-role one (the
 * RPC is `security definer` and admin-guarded on its own). That keeps
 * `auth.uid()` populated inside the function, which is where `uploaded_by`
 * comes from — a service-role call would lose the attribution.
 *
 * The PDF is uploaded to the `contracts` bucket *before* this runs, so a failed
 * upload never reaches here and can't leave a row pointing at a missing object.
 */
export const uploadContract = authActionClient
  .schema(uploadContractSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase.rpc('upload_contract', {
      p_employee_id: parsedInput.employeeId,
      p_storage_path: parsedInput.storagePath,
      p_file_name: parsedInput.fileName,
      p_note: parsedInput.note,
    });
    if (error) throw new Error(error.message);

    return data;
  });
