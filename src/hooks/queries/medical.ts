import { useQuery } from '@tanstack/react-query';

import { useHrmSettings } from '@/hooks/queries/settings';

import {
  mockCurrentEmployee,
  mockMedicalBalances,
} from '@/constants/mock/employees';
import { mockMedicalClaims } from '@/constants/mock/requests';
import { QueryKeys } from '@/constants/query-keys';

import { MedicalBalance, MedicalClaim } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const useMedicalClaims = (employeeId: string) => {
  return useQuery({
    queryKey: [QueryKeys.MEDICAL_CLAIMS, employeeId],
    queryFn: async (): Promise<MedicalClaim[]> => {
      await mockDelay();
      return mockMedicalClaims.filter(
        (claim) => claim.employeeId === employeeId,
      );
    },
  });
};

/** Cap and monthly accrual come from admin-configured settings, not the
 *  per-employee mock record — only `accrued` (the running balance) is
 *  genuinely per-employee. */
export const useMedicalBalance = (employeeId: string) => {
  const settings = useHrmSettings();
  const query = useQuery({
    queryKey: [QueryKeys.MEDICAL_BALANCE, employeeId],
    queryFn: async (): Promise<Pick<MedicalBalance, 'accrued'>> => {
      await mockDelay(300);
      return { accrued: mockMedicalBalances[employeeId]?.accrued ?? 0 };
    },
  });

  return {
    ...query,
    data:
      query.data && settings.data
        ? {
            accrued: query.data.accrued,
            cap: settings.data.medicalBalanceCap,
            monthlyAccrual: settings.data.medicalMonthlyAccrual,
          }
        : undefined,
    isLoading: query.isLoading || settings.isLoading,
  };
};

/** Own claims/balance for the signed-in employee (mocked as emp-1). */
export const useMyMedicalClaims = () =>
  useMedicalClaims(mockCurrentEmployee.id);

export const useMyMedicalBalance = () =>
  useMedicalBalance(mockCurrentEmployee.id);
