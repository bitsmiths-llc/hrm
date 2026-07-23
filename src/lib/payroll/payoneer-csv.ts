import { format } from 'date-fns';

/** The exact Payoneer bulk-payment template header row (from the `june_salaries`
 *  reference). Order and wording are load-bearing — Payoneer matches columns by
 *  header, so do not reword or reorder. `Amount to Pay` (source-currency amount)
 *  is intentionally left blank; Payoneer derives it from the balance + FX. */
export const PAYONEER_HEADER = [
  'Bank Account Holder Name',
  'Bank Account Number/IBAN',
  'Payoneer Balance to Pay From',
  'Amount to Pay',
  'Amount Recipient Gets',
  'Recipient Bank Account Currency',
  'Payment Reference (Optional)',
  'Transaction Description (Optional)',
] as const;

export const PAYONEER_CSV_MIME = 'text/csv';

/** One RFC 4180 field: quote only when the value carries a comma, quote or
 *  newline, and double any embedded quote. Employee names and account holders
 *  are free text, so this is the bit that actually has to be right — an
 *  unescaped comma in "Khan, Ali" would shift every later column by one. */
const csvField = (value: string | number) => {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * Array-of-arrays → CSV text, CRLF row endings per RFC 4180.
 *
 * Deliberately no UTF-8 BOM. A BOM is what makes Excel read non-ASCII names
 * correctly, but it would also prepend U+FEFF to the first header cell — and
 * Payoneer matches its columns by header text, so the BOM would break the very
 * import this file exists for. The consumer is Payoneer, not Excel.
 */
export const toCsv = (rows: readonly (readonly (string | number)[])[]) =>
  rows.map((row) => row.map(csvField).join(',')).join('\r\n');

/**
 * `salaries-jul-2026-20260717-153012.csv` — the payroll month the file pays,
 * then when it was generated.
 *
 * A run can be exported more than once (a late bank detail, a re-run after
 * excluding someone), so the generation timestamp is what keeps those files
 * distinct in the bucket and orders them in the history list.
 *
 * @param periodMonth the run's first-of-month 'YYYY-MM-DD' date
 */
export const payoneerFileName = (periodMonth: string, generatedAt: Date) => {
  const month = format(periodMonth, 'MMM-yyyy').toLowerCase();
  return `salaries-${month}-${format(generatedAt, 'yyyyMMdd-HHmmss')}.csv`;
};
