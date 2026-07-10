import * as z from 'zod';

export const passwordSchema = z
  .string({ message: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character',
  );

export const phoneNumberSchema = z
  .string()
  .min(7, 'Phone number must be at least 7 digits')
  .transform((val) => val.replace(/[^0-9]/g, ''));

/**
 * Digits-only string constrained to an inclusive length range. Pairs with the
 * `digits` mask on `MaskedInput`, which strips non-digits at the keystroke — so
 * this is the submit-time backstop for phone, emergency contact, account
 * number, postal code, and similar numeric identifiers.
 */
export const digitsOnly = (
  label: string,
  { min, max }: { min: number; max: number },
): z.ZodString =>
  z
    .string()
    .min(1, `${label} is required`)
    .regex(/^\d+$/, `${label} must contain digits only`)
    .min(min, `${label} must be at least ${min} digits`)
    .max(max, `${label} must be at most ${max} digits`);

/** Pakistan local mobile numbers are written as 03XX XXXXXXX — always exactly
 *  11 digits with a leading 0. */
export const PK_MOBILE_DIGITS = 11;
/** Without the local leading 0 (e.g. an international 92… form) a phone keeps
 *  this looser E.164-style range. */
const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 15;

const PK_MOBILE_REGEX = /^03\d{9}$/;

/**
 * Phone field: digits only, 10–15 digits for an international-style number, but
 * any value that begins with 0 is treated as a local Pakistan mobile number and
 * hard-capped to exactly 11 digits in the `03XXXXXXXXX` shape. Shared by the
 * phone and emergency-contact fields across onboarding and the contact editors.
 */
export const phoneNumberField = (label: string): z.ZodEffects<z.ZodString> =>
  digitsOnly(label, { min: PHONE_MIN_DIGITS, max: PHONE_MAX_DIGITS }).refine(
    (value) => !value.startsWith('0') || PK_MOBILE_REGEX.test(value),
    {
      message: `${label} starting with 0 must be a valid 11-digit Pakistan mobile number (e.g. 03001234567)`,
    },
  );

/** Keystroke-level cap for phone inputs: a local number (leading 0) stops at 11
 *  digits, an international one at 15. Fed to `TextFieldConfig.maxLength`. */
export const phoneMaxLength = (value: string): number =>
  value.startsWith('0') ? PK_MOBILE_DIGITS : PHONE_MAX_DIGITS;

/**
 * Residential contact fields shared by the onboarding personal-info step and
 * the profile contact editors. Address is split into street / city / postal
 * code so each is captured and stored on its own column.
 */
export const contactFields = {
  phone: phoneNumberField('Phone number'),
  emergencyContact: phoneNumberField('Emergency contact number'),
  address: z.string().min(5, 'Enter your street address'),
  city: z.string().min(2, 'Enter your city'),
  postalCode: digitsOnly('Postal code', { min: 4, max: 6 }),
};

export const EMERGENCY_CONTACT_DISTINCT_MESSAGE =
  'Emergency contact must be different from your phone number';

/** Guards against a self-referential emergency contact (same as phone). */
export const phonesAreDistinct = (value: {
  phone: string;
  emergencyContact: string;
}): boolean => value.phone !== value.emergencyContact;

/**
 * A full profile URL constrained to specific host(s), so a GitHub field can't
 * accept a LinkedIn link and vice-versa. A leading `www.` and any subdomain are
 * tolerated. Requires a protocol (matches Zod's `.url()`), so a bare
 * `github.com/x` without `https://` is rejected — consistent with asking for a
 * *full* profile URL.
 */
export const profileUrl = (
  label: string,
  allowedHosts: readonly string[],
  example: string,
): z.ZodEffects<z.ZodString> =>
  z
    .string()
    .url(`Enter a valid ${label} URL`)
    .refine(
      (value) => {
        try {
          const host = new URL(value).hostname
            .toLowerCase()
            .replace(/^www\./, '');
          return allowedHosts.some(
            (allowed) => host === allowed || host.endsWith(`.${allowed}`),
          );
        } catch {
          return false;
        }
      },
      { message: `Enter a ${label} URL (e.g. ${example})` },
    );

export function optional<T>(
  schema: z.ZodType<T>,
): z.ZodType<T | undefined | null> {
  return schema.nullable().optional();
}

const errorMapMessage = (message: string) => {
  return { message };
};

export const requiredString = (name: string): z.ZodString => {
  const errorMessage = `${name} is required`;
  return z
    .string({
      errorMap: () => errorMapMessage(errorMessage),
    })
    .min(1, errorMessage);
};

export const requiredNumber = (name: string): z.ZodNumber => {
  const errorMessage = `${name} is required`;
  return z.coerce
    .number({
      errorMap: () => errorMapMessage(errorMessage),
    })
    .min(1, `${name} must be greater than 0`);
};

export function getZodEnum<T extends string>(
  data: T[],
): z.ZodEnum<[T, ...T[]]> {
  return z.enum([data[0], ...data.slice(1)], {
    invalid_type_error: 'Invalid value',
  });
}
