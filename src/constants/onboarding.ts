import { type DocType } from '@/schema/onboarding';

export const onboardingSteps = [
  'Personal Info',
  'Bank Info',
  'Social Accounts',
  'Identity Documents',
  'Consent',
] as const;

/** The three identity documents collected in section 4, in display order. Each
 *  `docType` keys both the storage path (`<uid>/<doc_type>`) and the
 *  `employee_documents` unique constraint. */
export const identityDocuments: { docType: DocType; label: string }[] = [
  { docType: 'cnic_front', label: 'Front of CNIC' },
  { docType: 'cnic_back', label: 'Back of CNIC' },
  { docType: 'photo', label: 'Recent photo (face clearly visible)' },
];
