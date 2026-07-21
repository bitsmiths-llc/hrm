import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useEmployees } from '@/hooks/queries/employees';

import { authQuery } from '@/lib/client/auth-query';

import { mockCurrentEmployee } from '@/constants/mock/employees';
import { mockPolicyAcknowledgments } from '@/constants/mock/policies';
import { QueryKeys } from '@/constants/query-keys';

import {
  ActivePolicy,
  Policy,
  PolicyAcknowledgment,
  PolicyVersion,
} from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Both tables are readable by any authenticated user
 *  (`policies_select_authenticated` / `policy_versions_select_authenticated`);
 *  writes go through the admin-guarded RPCs, so nothing here needs a role
 *  check of its own. */
const POLICY_COLUMNS = 'id, title, slug, category';
const VERSION_COLUMNS = 'version, body_html, published_at';

type PolicyVersionRow = {
  version: number;
  body_html: string;
  published_at: string;
};

const toVersion = (row: PolicyVersionRow) =>
  ({
    version: row.version,
    contentHtml: row.body_html,
    publishedAt: row.published_at,
  }) satisfies PolicyVersion;

/** Oldest first — the `Policy.versions` contract every consumer relies on
 *  (`currentVersion` reads the last entry). */
const byVersionAscending = (a: PolicyVersion, b: PolicyVersion) =>
  a.version - b.version;

const fetchPolicies = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('policies')
    .select(`${POLICY_COLUMNS}, policy_versions(${VERSION_COLUMNS})`)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);

  return data.map(
    (row) =>
      ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        category: row.category,
        versions: row.policy_versions.map(toVersion).sort(byVersionAscending),
      }) satisfies Policy,
  );
});

const fetchPolicy = authQuery(
  async ({ supabase, params }): Promise<Policy | null> => {
    const { data, error } = await supabase
      .from('policies')
      .select(`${POLICY_COLUMNS}, policy_versions(${VERSION_COLUMNS})`)
      .eq('id', params.policyId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      category: data.category,
      versions: data.policy_versions.map(toVersion).sort(byVersionAscending),
    };
  },
  { paramsSchema: z.object({ policyId: z.string().uuid() }) },
);

/** Exactly one row per policy — the active version — enforced by the
 *  `policy_versions_one_active_idx` partial unique index. */
const fetchActivePolicies = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('policy_versions')
    .select(`version, published_at, policies(${POLICY_COLUMNS})`)
    .eq('is_active', true)
    .order('published_at', { ascending: false });
  if (error) throw new Error(error.message);

  return data.map(
    (row) =>
      ({
        id: row.policies.id,
        title: row.policies.title,
        slug: row.policies.slug,
        category: row.policies.category,
        version: row.version,
        publishedAt: row.published_at,
      }) satisfies ActivePolicy,
  );
});

/** Admin repository: every policy with its full version history. */
export const usePolicies = () =>
  useQuery({
    queryKey: [QueryKeys.POLICIES],
    queryFn: () => fetchPolicies(),
  });

/** One policy with its history — the admin editor and the employee detail
 *  view (which diffs the active body against an earlier version). */
export const usePolicy = (policyId: string) =>
  useQuery({
    queryKey: [QueryKeys.POLICIES, policyId],
    queryFn: () => fetchPolicy({ policyId }),
    enabled: !!policyId,
  });

/** Employee-facing list: the current version of each policy, nothing else. */
export const useActivePolicies = () =>
  useQuery({
    queryKey: [QueryKeys.ACTIVE_POLICIES],
    queryFn: () => fetchActivePolicies(),
  });

/** TODO(BIT-23): acknowledgments are still mock-backed — the
 *  `policy_acknowledgments` table, the `acknowledgePolicy` action, and the
 *  admin compliance roster all land in M3.2. Until then these records point at
 *  mock policy/employee ids, so nothing matches the real repository and every
 *  policy reads as unacknowledged. */
export const useAllPolicyAcknowledgments = () => {
  return useQuery({
    queryKey: [QueryKeys.POLICY_ACKNOWLEDGMENTS],
    queryFn: async (): Promise<PolicyAcknowledgment[]> => {
      await mockDelay(300);
      return mockPolicyAcknowledgments;
    },
    staleTime: Infinity,
  });
};

export const usePolicyAcknowledgments = (employeeId: string) => {
  const { data, isLoading } = useAllPolicyAcknowledgments();
  return {
    data: (data ?? []).filter((ack) => ack.employeeId === employeeId),
    isLoading,
  };
};

export const useMyPolicyAcknowledgments = () =>
  usePolicyAcknowledgments(mockCurrentEmployee.id);

export const currentVersion = (policy: Policy) =>
  policy.versions[policy.versions.length - 1];

/** Acknowledgments are append-only history (one record per version an
 *  employee acknowledged), so "where does this employee stand" means the
 *  record with the highest version for the policy. */
export const latestAcknowledgment = (
  acknowledgments: PolicyAcknowledgment[],
  policyId: string,
) =>
  acknowledgments
    .filter((ack) => ack.policyId === policyId)
    .reduce<
      PolicyAcknowledgment | undefined
    >((best, ack) => (!best || ack.acknowledgedVersion > best.acknowledgedVersion ? ack : best), undefined);

/** How many policies the signed-in employee still has to acknowledge —
 *  missing acknowledgments and stale ones (older version) both count.
 *  Drives the dashboard banner and the sidebar notification pill. */
export const useUnacknowledgedPolicyCount = () => {
  const { data: policies } = useActivePolicies();
  const { data: acknowledgments } = useMyPolicyAcknowledgments();

  return (policies ?? []).filter((policy) => {
    const ack = latestAcknowledgment(acknowledgments, policy.id);
    return !ack || ack.acknowledgedVersion < policy.version;
  }).length;
};

/** Active employees only — invited/onboarding accounts don't have
 *  self-service access yet, so acknowledgment doesn't apply to them. */
export const useActiveEmployees = () => {
  const { data: employees, isLoading } = useEmployees();
  return {
    data: (employees ?? []).filter((employee) => employee.status === 'active'),
    isLoading,
  };
};
