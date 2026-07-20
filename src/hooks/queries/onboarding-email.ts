import { useQuery } from '@tanstack/react-query';

import { mockOnboardingEmailTemplate } from '@/constants/mock/onboarding-email';
import { QueryKeys } from '@/constants/query-keys';

import { OnboardingEmailTemplate } from '@/types/hrm';

const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** The one reusable invitation email template. Saving edits it in the cache
 *  directly (see onboarding-template-form.tsx), same pattern as settings. */
export const useOnboardingEmailTemplate = () => {
  return useQuery({
    queryKey: [QueryKeys.ONBOARDING_EMAIL_TEMPLATE],
    queryFn: async (): Promise<OnboardingEmailTemplate> => {
      await mockDelay();
      return mockOnboardingEmailTemplate;
    },
    staleTime: Infinity,
  });
};
