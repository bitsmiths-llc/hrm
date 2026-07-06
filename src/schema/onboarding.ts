import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  dateOfBirth: z.string().min(1, 'Enter your date of birth'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  emergencyContact: z.string().min(7, 'Enter a valid phone number'),
  address: z.string().min(5, 'Enter your residential address'),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, 'CNIC format: 12345-1234567-1'),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

export const bankInfoSchema = z.object({
  bankName: z.string().min(2, 'Enter your bank name'),
  accountHolderName: z.string().min(2, 'Enter the account holder name'),
  accountNumber: z.string().min(6, 'Enter a valid account number'),
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

const singleFile = (message: string) =>
  z.array(z.instanceof(File)).length(1, message);

export const identityDocumentsSchema = z.object({
  cnicFront: singleFile('Upload the front of your CNIC'),
  cnicBack: singleFile('Upload the back of your CNIC'),
  photo: singleFile('Upload a recent photo with your face clearly visible'),
});

export type IdentityDocumentsInput = z.infer<typeof identityDocumentsSchema>;

export const consentSchema = z.object({
  consent: z.literal(true, {
    errorMap: () => ({
      message: 'You must confirm accuracy and consent to continue',
    }),
  }),
});

export type ConsentInput = z.infer<typeof consentSchema>;
