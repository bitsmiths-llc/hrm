import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useEmployees } from '@/hooks/queries/employees';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import {
  ActivePolicy,
  Policy,
  PolicyAcknowledgment,
  PolicyVersion,
} from '@/types/hrm';

/** Both tables are readable by any authenticated user
 *  (`policies_select_authenticated` / `policy_versions_select_authenticated`);
 *  writes go through the admin-guarded RPCs, so nothing here needs a role
 *  check of its own. */
const POLICY_COLUMNS = 'id, title, slug, category';
const VERSION_COLUMNS = 'id, version, body_html, published_at';

type PolicyVersionRow = {
  id: string;
  version: number;
  body_html: string;
  published_at: string;
};

const toVersion = (row: PolicyVersionRow) =>
  ({
    id: row.id,
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
    .select(`id, version, published_at, policies(${POLICY_COLUMNS})`)
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
        versionId: row.id,
        version: row.version,
        publishedAt: row.published_at,
      }) satisfies ActivePolicy,
  );
});

/** An acknowledgment row points at a *version*, so the policy it belongs to and
 *  the version number an employee signed both come from the embedded parent. */
const ACKNOWLEDGMENT_COLUMNS =
  'employee_id, policy_version_id, acknowledged_at, policy_versions(version, policy_id)';

type AcknowledgmentRow = {
  employee_id: string;
  policy_version_id: string;
  acknowledged_at: string;
  policy_versions: { version: number; policy_id: string };
};

const toAcknowledgment = (row: AcknowledgmentRow) =>
  ({
    policyId: row.policy_versions.policy_id,
    employeeId: row.employee_id,
    policyVersionId: row.policy_version_id,
    acknowledgedVersion: row.policy_versions.version,
    acknowledgedAt: row.acknowledged_at,
  }) satisfies PolicyAcknowledgment;

/** The caller's own acknowledgment history. The `employee_id` filter is
 *  redundant under `ack_select_own` but matters for an admin, whose
 *  `ack_select_admin` policy exposes everyone's rows. */
const fetchMyAcknowledgments = authQuery(
  async ({ supabase, user }): Promise<PolicyAcknowledgment[]> => {
    const { data, error } = await supabase
      .from('policy_acknowledgments')
      .select(ACKNOWLEDGMENT_COLUMNS)
      .eq('employee_id', user.id);
    if (error) throw new Error(error.message);

    return data.map(toAcknowledgment);
  },
);

/** Every employee's acknowledgments — admin only in practice, since
 *  `ack_select_own` narrows this to the caller's own rows for anyone else.
 *  Feeds the per-version roster in the policy editor's version history. */
const fetchAllAcknowledgments = authQuery(
  async ({ supabase }): Promise<PolicyAcknowledgment[]> => {
    const { data, error } = await supabase
      .from('policy_acknowledgments')
      .select(ACKNOWLEDGMENT_COLUMNS);
    if (error) throw new Error(error.message);

    return data.map(toAcknowledgment);
  },
);

/* Policy compliance query removed with the admin compliance UI. */

/* Policy linkage query removed with Linkage UI — reconciliation markers are
   still written by the `markPolicyReviewed` action, but the linkage list was
   deleted in favor of the Configuration tab. */

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

/** The signed-in employee's acknowledgments. Both this and the admin variant
 *  below sit under the same key prefix, so one invalidation after an
 *  acknowledgment refreshes whichever of them is mounted. */
export const useMyPolicyAcknowledgments = () =>
  useQuery({
    queryKey: [QueryKeys.POLICY_ACKNOWLEDGMENTS, 'mine'],
    queryFn: () => fetchMyAcknowledgments(),
  });

export const useAllPolicyAcknowledgments = () =>
  useQuery({
    queryKey: [QueryKeys.POLICY_ACKNOWLEDGMENTS, 'all'],
    queryFn: () => fetchAllAcknowledgments(),
  });

/** Admin linkage panel: per policy, its active version vs the reconciled marker,
 *  the inputs the panel turns into a drift badge. */
// `usePolicyLinkage` removed — no longer used anywhere in the UI.

export const currentVersion = (policy: Policy) =>
  policy.versions[policy.versions.length - 1];

/** Whether a specific version has been acknowledged. This — not a version
 *  number comparison — is the compliance test: acknowledgments are stored
 *  against a version id, and only the *active* version counts. */
export const hasAcknowledged = (
  acknowledgments: PolicyAcknowledgment[],
  policyVersionId: string,
) => acknowledgments.some((ack) => ack.policyVersionId === policyVersionId);

/** Acknowledgments are append-only history (one record per version an
 *  employee acknowledged), so "where does this employee stand" means the
 *  record with the highest version for the policy. Drives the "Behind (on v1)"
 *  label and the diff base on the employee detail page — both of which need
 *  the *previous* acknowledgment, not the current one. */
export const latestAcknowledgment = (
  acknowledgments: PolicyAcknowledgment[],
  policyId: string,
) =>
  acknowledgments
    .filter((ack) => ack.policyId === policyId)
    .reduce<
      PolicyAcknowledgment | undefined
    >((best, ack) => (!best || ack.acknowledgedVersion > best.acknowledgedVersion ? ack : best), undefined);

/** Active versions the signed-in employee still owes an acknowledgment on —
 *  the re-ack prompt's source. Derived from the two queries already in cache
 *  rather than fetched separately, so publishing a new version (which flips
 *  `is_active` and therefore changes `useActivePolicies`) re-raises the prompt
 *  without any extra invalidation. */
export const usePendingAcknowledgments = () => {
  const { data: policies, isLoading: policiesLoading } = useActivePolicies();
  const { data: acknowledgments, isLoading: acksLoading } =
    useMyPolicyAcknowledgments();

  return {
    data: (policies ?? []).filter(
      (policy) => !hasAcknowledged(acknowledgments ?? [], policy.versionId),
    ),
    isLoading: policiesLoading || acksLoading,
  };
};

/** How many policies the signed-in employee still has to acknowledge —
 *  missing acknowledgments and stale ones (older version) both count.
 *  Drives the dashboard banner and the sidebar notification pill. */
export const useUnacknowledgedPolicyCount = () =>
  usePendingAcknowledgments().data.length;

/** Active employees only — invited/onboarding accounts don't have
 *  self-service access yet, so acknowledgment doesn't apply to them. */
export const useActiveEmployees = () => {
  const { data: employees, isLoading } = useEmployees();
  return {
    data: (employees ?? []).filter((employee) => employee.status === 'active'),
    isLoading,
  };
};
