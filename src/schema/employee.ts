import { z } from 'zod';

export const inviteEmployeeSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
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
});

export type EmploymentConfigInput = z.infer<typeof employmentConfigSchema>;

export const contactInfoSchema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
  emergencyContact: z.string().min(7, 'Enter a valid phone number'),
  address: z.string().min(5, 'Enter your residential address'),
});

export type ContactInfoInput = z.infer<typeof contactInfoSchema>;
