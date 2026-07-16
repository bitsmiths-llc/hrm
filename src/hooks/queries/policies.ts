import { useQuery } from '@tanstack/react-query';

import { useEmployees } from '@/hooks/queries/employees';

import { mockCurrentEmployee } from '@/constants/mock/employees';
import {
  mockPolicies,
  mockPolicyAcknowledgments,
} from '@/constants/mock/policies';
import { QueryKeys } from '@/constants/query-keys';

import { Policy, PolicyAcknowledgment } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Publishing a version or acknowledging a policy mutates these caches
 *  directly via `setQueryData`, so both use `staleTime: Infinity` — same
 *  reasoning as payroll cycles/payslips (see payroll.ts). */
export const usePolicies = () => {
  return useQuery({
    queryKey: [QueryKeys.POLICIES],
    queryFn: async (): Promise<Policy[]> => {
      await mockDelay();
      return mockPolicies;
    },
    staleTime: Infinity,
  });
};

export const usePolicy = (policyId: string) => {
  const { data: policies, isLoading } = usePolicies();
  return {
    data: policies?.find((policy) => policy.id === policyId),
    isLoading,
  };
};

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

/** How many policies the signed-in employee still has to acknowledge —
 *  missing acknowledgments and stale ones (older version) both count.
 *  Drives the dashboard banner and the sidebar notification pill. */
export const useUnacknowledgedPolicyCount = () => {
  const { data: policies } = usePolicies();
  const { data: acknowledgments } = useMyPolicyAcknowledgments();

  return (policies ?? []).filter((policy) => {
    const latest = currentVersion(policy);
    const ack = acknowledgments.find((a) => a.policyId === policy.id);
    return !ack || ack.acknowledgedVersion < latest.version;
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
