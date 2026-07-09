import { useQuery } from '@tanstack/react-query';

import { toEmployee } from '@/hooks/queries/employees';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { Employee } from '@/types/hrm';

// One nested read across all four tables. RLS trims it to the caller's own
// row: `employees_select_self` on the base row, plus `bank_own` / `socials_own`
// and `employment_read_own` on the satellites — so no employeeId filter is
// needed here.
const fetchMyProfile = authQuery<undefined, Employee | null>(
  async ({ supabase, user }) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*, bank_details(*), socials(*), employment_details(*)')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toEmployee(data) : null;
  },
);

/** The signed-in employee's full profile — contact, bank, socials, and the
 *  read-only employment details (self, via RLS). */
export const useMyProfile = () =>
  useQuery({
    queryKey: [QueryKeys.MY_PROFILE],
    queryFn: () => fetchMyProfile(),
  });
