/** The Payoneer balances an employee can be paid from. The recipient bank
 *  account is always PKR; these are only the *source* currency. */
export const BALANCE_CURRENCIES = ['USD', 'GBP', 'EUR'] as const;

export type BalanceCurrency = (typeof BALANCE_CURRENCIES)[number];

export const DEFAULT_BALANCE_CURRENCY: BalanceCurrency = 'USD';

export const isBalanceCurrency = (value: string): value is BalanceCurrency =>
  (BALANCE_CURRENCIES as readonly string[]).includes(value);
