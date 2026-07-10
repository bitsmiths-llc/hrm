import { type TextFieldConfig } from '@/components/hrm/form-fields';

import { phoneMaxLength } from '@/schema/common';
import {
  type ContactInfoInput,
  type PersonalDetailsInput,
} from '@/schema/employee';
import { type BankInfoInput, PK_IBAN_LENGTH } from '@/schema/onboarding';

/** Identity text fields an admin self-edits (name + CNIC). Date of birth is a
 *  separate picker, rendered between them, so it isn't listed here. CNIC
 *  auto-inserts its dashes. */
export const personalDetailsFields: TextFieldConfig<
  Exclude<keyof PersonalDetailsInput, 'dateOfBirth'>
>[] = [
  { name: 'fullName', label: 'Full name', placeholder: 'John Doe' },
  {
    name: 'cnic',
    label: 'CNIC number',
    placeholder: '12345-1234567-1',
    mask: 'cnic',
  },
];

/** Contact fields shared by the self-service profile editor and the admin
 *  contact editor. Phone / emergency contact / postal code accept digits only;
 *  the address is split into street / city / postal code. */
export const contactInfoFields: TextFieldConfig<keyof ContactInfoInput>[] = [
  {
    name: 'phone',
    label: 'Phone number',
    placeholder: '03001234567',
    mask: 'digits',
    maxLength: phoneMaxLength,
  },
  {
    name: 'emergencyContact',
    label: 'Emergency contact number',
    placeholder: '03017654321',
    mask: 'digits',
    maxLength: phoneMaxLength,
  },
  {
    name: 'address',
    label: 'Street address',
    placeholder: 'House 12, Street 4, F-8/3',
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

/** Bank fields shown in the self-service profile bank editor, in display order.
 *  Account number accepts digits only; the compact dialog omits placeholders. */
export const bankInfoFields: TextFieldConfig<keyof BankInfoInput>[] = [
  { name: 'bankName', label: 'Bank name' },
  { name: 'accountHolderName', label: 'Account holder name' },
  {
    name: 'accountNumber',
    label: 'Account number',
    mask: 'digits',
    maxLength: 20,
  },
  { name: 'iban', label: 'IBAN', maxLength: PK_IBAN_LENGTH },
  { name: 'branch', label: 'Bank branch (optional)' },
];
