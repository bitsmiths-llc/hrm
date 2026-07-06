import { useQuery } from '@tanstack/react-query';

import { mockEmployees } from '@/constants/mock/employees';
import { QueryKeys } from '@/constants/query-keys';

import { Employee } from '@/types/hrm';

/** Frontend-only phase: hooks resolve mock fixtures behind the normal React
 *  Query interface, so swapping in Supabase later only touches the queryFn. */
const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const useEmployees = () => {
  return useQuery({
    queryKey: [QueryKeys.EMPLOYEES],
    queryFn: async (): Promise<Employee[]> => {
      await mockDelay();
      return mockEmployees;
    },
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.EMPLOYEES, id],
    queryFn: async (): Promise<Employee | null> => {
      await mockDelay(400);
      return mockEmployees.find((employee) => employee.id === id) ?? null;
    },
  });
};
