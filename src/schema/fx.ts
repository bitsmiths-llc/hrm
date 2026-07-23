import { z } from 'zod';

/**
 * The `latest` response from the keyless exchange-rate endpoint, narrowed to the
 * fields we use. `rates` maps an ISO-4217 code → units of that currency per one
 * unit of `base_code`.
 *
 * The upstream reports failures as a 200 with `result: 'error'`, so pinning the
 * literal here turns that into a parse error the query surfaces as an error
 * state rather than a silently empty rate table.
 */
export const fxRatesResponseSchema = z.object({
  result: z.literal('success'),
  base_code: z.string(),
  rates: z.record(z.string(), z.number()),
});

export type FxRatesResponse = z.infer<typeof fxRatesResponseSchema>;
