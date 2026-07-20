import { appConfig } from '@/config/app';

export const formatCurrency = (
  amount?: number | null,
  decimalPlaces?: number,
  /** ISO-4217 code — defaults to the app's own currency. Pass this only to show
   *  a genuinely foreign amount (e.g. a Payoneer source balance in USD). */
  currency: string = appConfig.defaultCurrency,
) => {
  if (!amount) return '';
  return new Intl.NumberFormat(appConfig.defaultLocale, {
    style: 'currency',
    currency,
    // Keeps PKR as "Rs" while rendering USD as "$" rather than en-PK's "US$".
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: decimalPlaces ?? 0,
    maximumFractionDigits: decimalPlaces ?? 0,
  }).format(amount);
};

export const formatNumber = (
  num?: number | null,
  decimalPlaces?: number,
): string => {
  if (!num) return '';
  return num.toLocaleString(appConfig.defaultLocale, {
    minimumFractionDigits: decimalPlaces ?? 0,
    maximumFractionDigits: decimalPlaces ?? 0,
  });
};
