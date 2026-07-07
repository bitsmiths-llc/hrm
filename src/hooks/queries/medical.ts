import { useQuery } from '@tanstack/react-query';

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

export const useMedicalBalance = (employeeId: string) => {
  return useQuery({
    queryKey: [QueryKeys.MEDICAL_BALANCE, employeeId],
    queryFn: async (): Promise<MedicalBalance> => {
      await mockDelay(300);
      return (
        mockMedicalBalances[employeeId] ?? {
          accrued: 0,
          cap: 50_000,
          monthlyAccrual: 5_000,
        }
      );
    },
  });
};

/** Own claims/balance for the signed-in employee (mocked as emp-1). */
export const useMyMedicalClaims = () =>
  useMedicalClaims(mockCurrentEmployee.id);

export const useMyMedicalBalance = () =>
  useMedicalBalance(mockCurrentEmployee.id);
