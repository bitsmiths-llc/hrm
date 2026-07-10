import { z } from 'zod';

import {
  contactFields,
  digitsOnly,
  EMERGENCY_CONTACT_DISTINCT_MESSAGE,
  phonesAreDistinct,
} from '@/schema/common';

// Email is intentionally NOT part of this schema: it's the invite identity, set
// at invite time and never changed during onboarding (the form shows it
// read-only). savePersonal writes only the columns below.
export const personalInfoSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    dateOfBirth: z.string().min(1, 'Enter your date of birth'),
    ...contactFields,
    cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, 'CNIC format: 12345-1234567-1'),
  })
  .refine(phonesAreDistinct, {
    message: EMERGENCY_CONTACT_DISTINCT_MESSAGE,
    path: ['emergencyContact'],
  });

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

export const bankInfoSchema = z.object({
  bankName: z.string().min(2, 'Enter your bank name'),
  accountHolderName: z.string().min(2, 'Enter the account holder name'),
  accountNumber: digitsOnly('Account number', { min: 6, max: 20 }),
  iban: z
    .string()
    .regex(/^PK\d{2}[A-Z]{4}\d{16}$/i, 'IBAN format: PK36ABCD0000001123456702'),
  branch: z.string().optional(),
});

export type BankInfoInput = z.infer<typeof bankInfoSchema>;

export const socialAccountsSchema = z.object({
  github: z.string().url('Enter your full GitHub profile URL'),
  linkedin: z.string().url('Enter your full LinkedIn profile URL'),
  twitter: z
    .string()
    .url('Enter a full profile URL')
    .optional()
    .or(z.literal('')),
});

export type SocialAccountsInput = z.infer<typeof socialAccountsSchema>;

// Identity documents upload immediately (one storage object + one
// employee_documents row per type) rather than as part of a form submit, so
// there's no file-array form schema — only the doc_type discriminator, which
// keys both the storage path (`<uid>/<doc_type>`) and the row's unique
// constraint.
export const docTypes = ['cnic_front', 'cnic_back', 'photo'] as const;

export type DocType = (typeof docTypes)[number];

export const consentSchema = z.object({
  consent: z.literal(true, {
    errorMap: () => ({
      message: 'You must confirm accuracy and consent to continue',
    }),
  }),
});

export type ConsentInput = z.infer<typeof consentSchema>;
