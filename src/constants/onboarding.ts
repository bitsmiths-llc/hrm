import { type TextFieldConfig } from '@/components/hrm/form-fields';

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
 *  separate picker (after the first field), so it isn't listed here. Phone and
 *  emergency contact accept digits only; CNIC auto-inserts its dashes; the
 *  address is split into street / city / postal code. */
export const personalInfoFields: TextFieldConfig<
  Exclude<keyof PersonalInfoInput, 'dateOfBirth'>
>[] = [
  { name: 'fullName', label: 'Full name', placeholder: 'John Doe', fullWidth: true },
  {
    name: 'phone',
    label: 'Phone number',
    placeholder: '03001234567',
    mask: 'digits',
    maxLength: 15,
  },
  {
    name: 'emergencyContact',
    label: 'Emergency contact number',
    placeholder: '03017654321',
    mask: 'digits',
    maxLength: 15,
  },
  {
    name: 'cnic',
    label: 'CNIC number',
    placeholder: '12345-1234567-1',
    mask: 'cnic',
  },
  {
    name: 'address',
    label: 'Street address',
    placeholder: 'House 12, Street 4, F-8/3',
    fullWidth: true,
  },
  { name: 'city', label: 'City', placeholder: 'Islamabad' },
  {
    name: 'postalCode',
    label: 'Postal code',
    placeholder: '44000',
    mask: 'digits',
    maxLength: 6,
  },
];

/** Section 2 bank fields, in display order. Account number accepts digits
 *  only. */
export const bankInfoFields: TextFieldConfig<keyof BankInfoInput>[] = [
  { name: 'bankName', label: 'Bank name', placeholder: 'e.g. Meezan Bank' },
  {
    name: 'accountHolderName',
    label: 'Account holder name',
    placeholder: 'John Doe',
  },
  {
    name: 'accountNumber',
    label: 'Account number',
    placeholder: '01234567890123',
    mask: 'digits',
    maxLength: 20,
  },
  { name: 'iban', label: 'IBAN', placeholder: 'PK36MEZN0001234567890123' },
  {
    name: 'branch',
    label: 'Bank branch (optional)',
    placeholder: 'F-8 Markaz, Islamabad',
  },
];

/** Identity-document upload constraints (section 4). Files are restricted to
 *  PNG or PDF and capped at {@link IDENTITY_DOC_MAX_SIZE_MB}MB — enforced both
 *  by the native picker (`accept`) and by `FileUpload`'s own validation. */
export const IDENTITY_DOC_MIME_TYPES = ['image/png', 'application/pdf'] as const;
export const IDENTITY_DOC_ACCEPT = IDENTITY_DOC_MIME_TYPES.join(',');
export const IDENTITY_DOC_MAX_SIZE_MB = 5;
export const IDENTITY_DOC_HINT = 'PNG or PDF · up to 5MB';

/** Section 3 social account fields, in display order. */
export const socialAccountsFields: {
  name: keyof SocialAccountsInput;
  label: string;
  placeholder: string;
}[] = [
  {
    name: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/username',
  },
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
