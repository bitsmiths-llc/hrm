'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { MEDICAL_PROOFS_BUCKET } from '@/hooks/queries/medical';

import { createMedicalClaim } from '@/actions/medical';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { QueryKeys } from '@/constants/query-keys';
import { type MedicalClaimInput } from '@/schema/medical';

/** Storage keys must be URL-safe; keep the original name on the DB row instead. */
const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

/**
 * Submit a medical claim end-to-end. The claim row is inserted (and admins
 * emailed) by the `createMedicalClaim` server action; the proof files are then
 * uploaded client-side into `medical-proofs/<uid>/<claimId>/…` under the
 * caller's own RLS (medproofs_own), one `medical_claim_files` row per file. The
 * index prefix keeps two same-named files distinct. Invalidates the caller's
 * history + balance, then hands back via `onSuccess` (close dialog, toast).
 *
 * The claim is created before the files exist, so a mid-flight upload failure
 * leaves a pending claim with fewer/no proofs; the toast surfaces it and an
 * admin can reject it — acceptable for now (mirrors the identity-docs flow).
 */
export function useCreateMedicalClaim(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proofFiles, ...fields }: MedicalClaimInput) => {
      const supabase = createSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('You are not signed in.');

      // 1. Insert the claim (RLS pins pending) + notify admins, via the action.
      const result = await createMedicalClaim(fields);
      if (result?.serverError) throw new Error(result.serverError);
      if (result?.validationErrors) {
        throw new Error('Some claim details were invalid. Please review them.');
      }
      const claimId = result?.data?.id;
      if (!claimId) throw new Error('Could not create the claim.');

      // 2. Upload each proof file, then 3. record one file row per upload. Both
      //    run under the caller's RLS. Parallel — no await-in-loop.
      const rows = await Promise.all(
        proofFiles.map(async (file, index) => {
          const path = `${uid}/${claimId}/${index}-${safeName(file.name)}`;
          const { error } = await supabase.storage
            .from(MEDICAL_PROOFS_BUCKET)
            .upload(path, file, { upsert: false, contentType: file.type });
          if (error) throw error;
          return {
            claim_id: claimId,
            storage_path: path,
            file_name: file.name,
          };
        }),
      );

      const { error: rowsError } = await supabase
        .from('medical_claim_files')
        .insert(rows);
      if (rowsError) throw rowsError;

      return { id: claimId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MEDICAL_CLAIMS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MEDICAL_BALANCE] });
      onSuccess?.();
    },
    onError: (error: Error) =>
      toast.error('Could not submit the claim', {
        description: error.message,
      }),
  });
}
