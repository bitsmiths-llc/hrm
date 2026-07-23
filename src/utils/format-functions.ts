/** Strips every non-digit character, leaving a bare digit string. */
export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

/**
 * Formats up to 13 CNIC digits as `#####-#######-#` while the user types, so the
 * dashes are inserted automatically and the value always matches the stored
 * format. Extra digits and any non-digit input are dropped.
 */
export const formatCnic = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 13);
  return [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)]
    .filter(Boolean)
    .join('-');
};
