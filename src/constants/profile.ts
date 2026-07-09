import { type BankInfoInput } from '@/schema/onboarding';

/** Bank fields shown in the self-service profile bank editor, in display order.
 *  Labels only — the compact dialog doesn't use placeholders. */
export const bankInfoFields: { name: keyof BankInfoInput; label: string }[] = [
  { name: 'bankName', label: 'Bank name' },
  { name: 'accountHolderName', label: 'Account holder name' },
  { name: 'accountNumber', label: 'Account number' },
  { name: 'iban', label: 'IBAN' },
  { name: 'branch', label: 'Bank branch (optional)' },
];
