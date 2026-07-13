import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { Employee } from '@/types/hrm';
import { type Tables } from '@/types/supabase';

// The directory rows are `employees` joined to their one-to-one detail tables
// (each returns a single row or null for a not-yet-onboarded invitee).
export type EmployeeRow = Tables<'employees'> & {
  employment_details: Tables<'employment_details'> | null;
  bank_details: Tables<'bank_details'> | null;
  socials: Tables<'socials'> | null;
};

/** Map a joined employees row onto the `Employee` domain type, filling the
 *  gaps left by a not-yet-onboarded invitee (no detail rows yet) with sensible
 *  defaults. Shared by the admin directory and the self-service profile. */
export function toEmployee(row: EmployeeRow): Employee {
  const { employment_details: work, bank_details: bank, socials: social } = row;
  return {
    id: row.id,
    fullName: row.full_name ?? '',
    email: row.email,
    phone: row.phone ?? '',
    emergencyContact: row.emergency_contact ?? '',
    address: row.address ?? '',
    city: row.city ?? '',
    postalCode: row.postal_code ?? '',
    cnic: row.cnic ?? '',
    dateOfBirth: row.date_of_birth ?? '',
    bank: bank
      ? {
          bankName: bank.bank_name ?? '',
          accountHolderName: bank.account_holder ?? '',
          accountNumber: bank.account_number ?? '',
          iban: bank.iban ?? '',
          branch: bank.bank_branch ?? undefined,
        }
      : null,
    social: social
      ? {
          github: social.github_url ?? '',
          linkedin: social.linkedin_url ?? '',
          twitter: social.twitter_url ?? undefined,
        }
      : null,
    employmentType: work?.employment_type ?? 'full_time',
    // TODO: employment_details has no employment_stage column yet, so this is a
    // placeholder. Medical eligibility (lib/medical-eligibility.ts) and the admin
    // EmploymentConfigForm stage selector stay cosmetic until a migration adds it.
    employmentStage: 'confirmed',
    baseSalary: work?.base_salary ?? 0,
    workingHours: work?.working_hours ?? 0,
    designation: work?.designation ?? '',
    department: work?.department ?? '',
    status: row.account_status,
    reviewNote: row.review_note,
    invitedAt: row.invited_at ?? '',
    joinedAt: row.activated_at,
  };
}

// The directory lists employees only: admins manage their own profile from the
// sidebar and are never surfaced here (an admin should see neither their own
// row nor other admins), so the query is scoped to the `employee` role.
const fetchEmployees = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*, employment_details(*), bank_details(*), socials(*)')
    .eq('role', 'employee')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(toEmployee);
});

const fetchEmployee = authQuery(
  async ({ supabase, params }) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*, employment_details(*), bank_details(*), socials(*)')
      .eq('id', params.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toEmployee(data) : null;
  },
  { paramsSchema: z.object({ id: z.string() }) },
);

export const useEmployees = () => {
  return useQuery({
    queryKey: [QueryKeys.EMPLOYEES],
    queryFn: () => fetchEmployees(),
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: [QueryKeys.EMPLOYEES, id],
    queryFn: () => fetchEmployee({ id }),
  });
};

// Identity fields for the signed-in user — drives the greeting and the sidebar
// identity card. Kept minimal (no detail-table joins) since callers only need
// who the user is and which role's app they're in.
export type CurrentEmployee = Pick<
  Tables<'employees'>,
  'id' | 'full_name' | 'email' | 'role' | 'account_status'
>;

const fetchCurrentEmployee = authQuery<undefined, CurrentEmployee | null>(
  async ({ supabase, user }) => {
    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name, email, role, account_status')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },
);

/** The signed-in employee's own identity row (self, via RLS). Kept on its own
 *  key so it doesn't collide with the full profile read (`useMyProfile`). */
export const useCurrentEmployee = () =>
  useQuery({
    queryKey: [QueryKeys.CURRENT_EMPLOYEE],
    queryFn: () => fetchCurrentEmployee(),
  });
