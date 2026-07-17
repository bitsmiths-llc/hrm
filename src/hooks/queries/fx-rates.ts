import { useQuery } from '@tanstack/react-query';

import { appConfig } from '@/config/app';
import { QueryKeys } from '@/constants/query-keys';
import { fxRatesResponseSchema } from '@/schema/fx';

// Rates for one base currency against every other. Public/keyless and CORS-open,
// so it's fetched straight from the browser rather than proxied through an
// action — there's no secret to protect and no user data in the request.
const fetchFxRates = async (base: string) => {
  const response = await fetch(`${appConfig.fx.ratesUrl}/${base}`);
  if (!response.ok) {
    throw new Error(`Exchange-rate lookup failed (${response.status})`);
  }
  return fxRatesResponseSchema.parse(await response.json());
};

/**
 * Live exchange rates from `base` to every other currency. Display-only: the
 * amount actually paid is always the frozen PKR payslip total, so a stale or
 * failed rate can never change what an employee receives.
 */
export const useFxRates = (base: string = appConfig.defaultCurrency) =>
  useQuery({
    queryKey: [QueryKeys.FX_RATES, base],
    queryFn: () => fetchFxRates(base),
    staleTime: appConfig.fx.staleTimeMs,
  });
