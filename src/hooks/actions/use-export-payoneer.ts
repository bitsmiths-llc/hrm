'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { exportPayoneer } from '@/actions/payroll-export';

import { onError } from '@/lib/show-error-toast';
import { downloadUrl } from '@/utils/download-functions';

import { QueryKeys } from '@/constants/query-keys';

/**
 * Generate the Payoneer file for a locked run (admin). The action is the source
 * of truth: it uploads the artifact + records the export row, then returns a
 * short-lived signed URL we use to download that exact file immediately. Also
 * invalidates the run-export list so the history drill-down shows the new file.
 */
export function useExportPayoneer(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(exportPayoneer, {
    onSuccess: ({ data }) => {
      if (data?.signed_url) {
        const filename =
          data.file_path.split('/').pop() ?? 'payoneer-export.xlsx';
        downloadUrl(data.signed_url, filename);
      }
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_EXPORTS] });
      toast.success(
        `Exported ${data?.count ?? 0} ${
          data?.count === 1 ? 'payslip' : 'payslips'
        } for Payoneer`,
      );
      onSuccess?.();
    },
    onError,
  });
}
