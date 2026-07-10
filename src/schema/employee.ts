import { z } from 'zod';

import { requiredString } from '@/schema/common';

/** UUID identifying the target employee for an admin write. */
export const employeeIdField = z.string().uuid();
export const employeeIdSchema = z.object({ employeeId: employeeIdField });

export const inviteEmployeeSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  // Optional: admins may invite with just an email. The "min 2" rule only bites
  // when a name is actually typed — a blank field (RHF sends '') is allowed and
  // normalised to null in the action.
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .optional()
    .or(z.literal('')),
});

export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;

export const employmentConfigSchema = z.object({
  employmentType: z.enum(['full_time', 'part_time'], {
    required_error: 'Select an employment type',
  }),
  baseSalary: z.coerce
    .number({ invalid_type_error: 'Enter the base salary' })
    .positive('Base salary must be greater than 0'),
  workingHours: z.coerce
    .number({ invalid_type_error: 'Enter the standard working hours' })
    .positive('Working hours must be greater than 0')
    .max(400, 'Working hours look too high for one pay period'),
  designation: z.string().min(2, 'Enter a designation'),
  department: z.string().optional().or(z.literal('')),
});

export type EmploymentConfigInput = z.infer<typeof employmentConfigSchema>;

export const contactInfoSchema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
  emergencyContact: z.string().min(7, 'Enter a valid phone number'),
  address: z.string().min(5, 'Enter your residential address'),
});

export type ContactInfoInput = z.infer<typeof contactInfoSchema>;

/** Identity fields on the employees row. Same three columns onboarding's
 *  `savePersonal` writes (name / DOB / CNIC), minus the contact fields that
 *  have their own card. Admins self-edit these on their own profile — an admin
 *  has no admin above them to manage their record. */
export const personalDetailsSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  dateOfBirth: z.string().min(1, 'Enter your date of birth'),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, 'CNIC format: 12345-1234567-1'),
});

export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;

/** Admin's note when returning a submission to onboarding (BIT-10). */
export const returnOnboardingSchema = z.object({
  reviewNote: requiredString('A review note'),
});

export type ReturnOnboardingInput = z.infer<typeof returnOnboardingSchema>;
