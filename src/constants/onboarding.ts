import {
  type BankInfoInput,
  type DocType,
  type PersonalInfoInput,
  type SocialAccountsInput,
} from '@/schema/onboarding';

export const onboardingSteps = [
  'Personal Info',
  'Bank Info',
  'Social Accounts',
  'Identity Documents',
  'Consent',
] as const;

/** Section 1 text inputs, in display order. Date of birth is rendered as a
 *  separate picker (after the first field), so it isn't listed here. */
export const personalInfoFields: {
  name: keyof PersonalInfoInput;
  label: string;
  placeholder: string;
}[] = [
  { name: 'fullName', label: 'Full name', placeholder: 'Ayesha Khan' },
  { name: 'phone', label: 'Phone number', placeholder: '+92 300 1234567' },
  {
    name: 'emergencyContact',
    label: 'Emergency contact number',
    placeholder: '+92 301 7654321',
  },
  {
    name: 'address',
    label: 'Residential address',
    placeholder: 'House, street, area, city',
  },
  { name: 'cnic', label: 'CNIC number', placeholder: '12345-1234567-1' },
];

/** Section 2 bank fields, in display order. */
export const bankInfoFields: {
  name: keyof BankInfoInput;
  label: string;
  placeholder: string;
}[] = [
  { name: 'bankName', label: 'Bank name', placeholder: 'Meezan Bank' },
  {
    name: 'accountHolderName',
    label: 'Account holder name',
    placeholder: 'Ayesha Khan',
  },
  {
    name: 'accountNumber',
    label: 'Account number',
    placeholder: '01234567890123',
  },
  { name: 'iban', label: 'IBAN', placeholder: 'PK36MEZN0001234567890123' },
  {
    name: 'branch',
    label: 'Bank branch (optional)',
    placeholder: 'F-8 Markaz, Islamabad',
  },
];

/** Section 3 social account fields, in display order. */
export const socialAccountsFields: {
  name: keyof SocialAccountsInput;
  label: string;
  placeholder: string;
}[] = [
  { name: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    name: 'twitter',
    label: 'Twitter (optional)',
    placeholder: 'https://twitter.com/username',
  },
];

/** The three identity documents collected in section 4, in display order. Each
 *  `docType` keys both the storage path (`<uid>/<doc_type>`) and the
 *  `employee_documents` unique constraint. */
export const identityDocuments: { docType: DocType; label: string }[] = [
  { docType: 'cnic_front', label: 'Front of CNIC' },
  { docType: 'cnic_back', label: 'Back of CNIC' },
  { docType: 'photo', label: 'Recent photo (face clearly visible)' },
];
