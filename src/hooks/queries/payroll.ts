import { useQuery } from '@tanstack/react-query';

import { mockPayslips } from '@/constants/mock/payroll';
import { QueryKeys } from '@/constants/query-keys';

import { Payslip } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const usePayslips = (employeeId: string) => {
  return useQuery({
    queryKey: [QueryKeys.PAYSLIPS, employeeId],
    queryFn: async (): Promise<Payslip[]> => {
      await mockDelay();
      return mockPayslips.filter(
        (payslip) => payslip.employeeId === employeeId,
      );
    },
  });
};
