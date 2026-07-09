'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import {
  updateEmployeeBank,
  updateEmployeeContact,
  updateEmployeeSocials,
  updateEmploymentDetails,
} from '@/actions/employees';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Shared invalidation for the admin profile editor: refresh both the detail
 *  query for this employee and the directory list (designation/type/department
 *  can change what the table shows). */
function useInvalidateEmployee(employeeId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.EMPLOYEES, employeeId],
    });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
  };
}

export function useUpdateEmployeeContact(
  employeeId: string,
  onSuccess?: () => void,
) {
  const invalidate = useInvalidateEmployee(employeeId);
  return useAction(updateEmployeeContact, {
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
    onError,
  });
}

export function useUpdateEmployeeBank(
  employeeId: string,
  onSuccess?: () => void,
) {
  const invalidate = useInvalidateEmployee(employeeId);
  return useAction(updateEmployeeBank, {
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
    onError,
  });
}

export function useUpdateEmployeeSocials(
  employeeId: string,
  onSuccess?: () => void,
) {
  const invalidate = useInvalidateEmployee(employeeId);
  return useAction(updateEmployeeSocials, {
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
    onError,
  });
}

export function useUpdateEmploymentDetails(
  employeeId: string,
  onSuccess?: () => void,
) {
  const invalidate = useInvalidateEmployee(employeeId);
  return useAction(updateEmploymentDetails, {
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
    onError,
  });
}
