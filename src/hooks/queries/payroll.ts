import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  useAllMedicalClaims,
  useAllOvertimeLogs,
} from '@/hooks/queries/approvals';
import { useEmployees } from '@/hooks/queries/employees';

import {
  calcOvertimePay,
  calcPayslipTotal,
  calcTotalBase,
} from '@/utils/payroll-functions';

import { mockPayrollCycles, mockPayslips } from '@/constants/mock/payroll';
import { QueryKeys } from '@/constants/query-keys';

import { PayrollCycle, Payslip } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** All payslips, cache-backed so a just-locked cycle's frozen rows (seeded by
 *  `useCurrentCycleRows`'s consumer on lock) show up immediately everywhere
 *  that reads payslips, without a page refresh. */
export const useAllPayslips = () => {
  return useQuery({
    queryKey: [QueryKeys.PAYSLIPS],
    queryFn: async (): Promise<Payslip[]> => {
      await mockDelay();
      return mockPayslips;
    },
    // Locking a cycle seeds this cache with frozen rows via setQueryData;
    // the default staleTime would trigger a refetch on the next mount that
    // re-reads the (unmutated) static mock array and silently undoes it.
    staleTime: Infinity,
  });
};

export const usePayslips = (employeeId: string) => {
  const { data, isLoading } = useAllPayslips();
  const filtered = useMemo(
    () => (data ?? []).filter((payslip) => payslip.employeeId === employeeId),
    [data, employeeId],
  );
  return { data: filtered, isLoading };
};

export const usePayrollCycles = () => {
  return useQuery({
    queryKey: [QueryKeys.PAYROLL_CYCLES],
    queryFn: async (): Promise<PayrollCycle[]> => {
      await mockDelay();
      return mockPayrollCycles;
    },
    // Same reasoning as useAllPayslips: locking mutates this cache directly,
    // and the mutation must survive remounts without an overwriting refetch.
    staleTime: Infinity,
  });
};

const daysInMonth = (month: string) => {
  const [year, monthIndex] = month.split('-').map(Number);
  return new Date(year, monthIndex, 0).getDate();
};

/** Live-calculated per-employee rows for the currently open payroll cycle —
 *  composed from the same employee/claim/log hooks the rest of the app uses,
 *  rather than a separate mock fetch, so it reflects whatever those already
 *  return. Medical and overtime only count approved records dated within the
 *  cycle month. */
export const useCurrentCycleRows = () => {
  const cycle = mockPayrollCycles.find((c) => c.status === 'open');
  const employees = useEmployees();
  const medicalClaims = useAllMedicalClaims();
  const overtimeLogs = useAllOvertimeLogs();

  const rows = useMemo<Payslip[]>(() => {
    if (!cycle) return [];
    const cycleDays = daysInMonth(cycle.month);

    return (employees.data ?? [])
      .filter((employee) => employee.status === 'active')
      .map((employee) => {
        const medical = (medicalClaims.data ?? [])
          .filter(
            (claim) =>
              claim.employeeId === employee.id &&
              claim.status === 'approved' &&
              claim.expenseDate.startsWith(cycle.month),
          )
          .reduce((sum, claim) => sum + claim.amount, 0);

        const overtimeHours = (overtimeLogs.data ?? [])
          .filter(
            (log) =>
              log.employeeId === employee.id &&
              log.status === 'approved' &&
              log.date.startsWith(cycle.month),
          )
          .reduce((sum, log) => sum + log.hours, 0);

        const overtimePay = calcOvertimePay(
          employee.baseSalary,
          employee.workingHours,
          overtimeHours,
        );
        const totalBase = calcTotalBase(
          employee.baseSalary,
          cycleDays,
          cycleDays,
        );

        return {
          id: `cycle-${employee.id}`,
          employeeId: employee.id,
          employeeName: employee.fullName,
          cycleMonth: cycle.month,
          baseSalary: employee.baseSalary,
          daysWorked: cycleDays,
          daysInMonth: cycleDays,
          totalBase,
          medical,
          overtimeHours,
          overtimePay,
          total: calcPayslipTotal(totalBase, medical, overtimePay),
        };
      });
  }, [cycle, employees.data, medicalClaims.data, overtimeLogs.data]);

  return {
    cycle,
    rows,
    isLoading:
      employees.isLoading || medicalClaims.isLoading || overtimeLogs.isLoading,
  };
};
