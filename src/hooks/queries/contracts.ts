import { useQuery } from '@tanstack/react-query';

import { mockContracts } from '@/constants/mock/contracts';
import { mockCurrentEmployee } from '@/constants/mock/employees';
import { QueryKeys } from '@/constants/query-keys';

import { EmployeeContract } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Uploading a replacement mutates this cache directly via `setQueryData`,
 *  same reasoning as payroll cycles/policies — see payroll.ts. */
export const useAllContracts = () => {
  return useQuery({
    queryKey: [QueryKeys.CONTRACTS],
    queryFn: async (): Promise<EmployeeContract[]> => {
      await mockDelay();
      return mockContracts;
    },
    staleTime: Infinity,
  });
};

export const useEmployeeContract = (employeeId: string) => {
  const { data, isLoading } = useAllContracts();
  return {
    data: data?.find((contract) => contract.employeeId === employeeId),
    isLoading,
  };
};

export const useMyContract = () => useEmployeeContract(mockCurrentEmployee.id);
