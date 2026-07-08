import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';
import {
  type BankInfoInput,
  type PersonalInfoInput,
  type SocialAccountsInput,
} from '@/schema/onboarding';

import { type Tables } from '@/types/supabase';

/** The caller's saved onboarding values, mapped from the DB columns back onto
 *  the wizard's form shapes so each section can restore on refresh. Missing
 *  satellite rows (bank/socials not yet saved) collapse to empty strings. */
type OnboardingData = {
  email: string;
  personal: PersonalInfoInput;
  bank: BankInfoInput;
  social: SocialAccountsInput;
};

const fetchOnboarding = authQuery<undefined, OnboardingData>(
  async ({ supabase, user }) => {
    const { data, error } = await supabase
      .from('employees')
      .select('*, bank_details(*), socials(*)')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const bank = data?.bank_details ?? null;
    const social = data?.socials ?? null;

    return {
      email: data?.email ?? '',
      personal: {
        fullName: data?.full_name ?? '',
        dateOfBirth: data?.date_of_birth ?? '',
        phone: data?.phone ?? '',
        emergencyContact: data?.emergency_contact ?? '',
        address: data?.address ?? '',
        cnic: data?.cnic ?? '',
      },
      bank: {
        bankName: bank?.bank_name ?? '',
        accountHolderName: bank?.account_holder ?? '',
        accountNumber: bank?.account_number ?? '',
        iban: bank?.iban ?? '',
        branch: bank?.bank_branch ?? '',
      },
      social: {
        github: social?.github_url ?? '',
        linkedin: social?.linkedin_url ?? '',
        twitter: social?.twitter_url ?? '',
      },
    };
  },
);

/** Section 1–3 saved values for the onboarding wizard (self, via RLS). */
export const useOnboardingData = () =>
  useQuery({
    queryKey: [QueryKeys.MY_PROFILE],
    queryFn: () => fetchOnboarding(),
  });

type UploadedDocument = Pick<
  Tables<'employee_documents'>,
  'doc_type' | 'storage_path' | 'uploaded_at'
>;

const fetchEmployeeDocuments = authQuery<undefined, UploadedDocument[]>(
  async ({ supabase, user }) => {
    const { data, error } = await supabase
      .from('employee_documents')
      .select('doc_type, storage_path, uploaded_at')
      .eq('employee_id', user.id);
    if (error) throw new Error(error.message);
    return data;
  },
);

/** The caller's uploaded identity documents (section 4). Keyed by userId so the
 *  upload mutation can invalidate exactly this cache entry. */
export const useEmployeeDocuments = (userId: string) =>
  useQuery({
    queryKey: [QueryKeys.EMPLOYEE_DOCUMENTS, userId],
    queryFn: () => fetchEmployeeDocuments(),
    enabled: !!userId,
  });
