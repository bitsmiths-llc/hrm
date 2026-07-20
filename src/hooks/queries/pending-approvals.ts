import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

/** The four sources that feed the unified approvals queue (BIT-18). */
export type ApprovalKind = 'leave' | 'medical' | 'overtime' | 'onboarding';

/** One normalized row from `pending_approvals()`. Each source projects to this
 *  common shape; `amount` is populated only for medical (whole PKR) and null for
 *  the rest, and `submitted_at` unifies each source's timestamp for ordering. */
export type PendingApproval = {
  kind: ApprovalKind;
  item_id: string;
  employee_id: string;
  employee_name: string;
  summary: string;
  amount: number | null;
  submitted_at: string;
};

// Admin: every pending item across leave/medical/overtime/onboarding in one
// guarded round-trip, oldest first. The RPC is security definer + asserts
// is_admin() itself (RLS is bypassed), so a non-admin gets a 42501 rather than a
// partial read — the /admin route guard keeps them off the page in the first
// place. This is the queue's source of truth for membership and order; the page
// enriches the open row's detail sheet from the per-module admin reads.
const fetchPendingApprovals = authQuery(
  async ({ supabase }): Promise<PendingApproval[]> => {
    const { data, error } = await supabase.rpc('pending_approvals');
    if (error) throw new Error(error.message);
    return (data ?? []) as PendingApproval[];
  },
);

/** Admin: the guarded, union-normalized pending queue across all four sources. */
export const usePendingApprovals = () =>
  useQuery({
    queryKey: [QueryKeys.PENDING_APPROVALS],
    queryFn: () => fetchPendingApprovals(),
  });
