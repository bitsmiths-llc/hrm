import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { PendingApproval } from '@/types/hrm';

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
