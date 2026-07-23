import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { OnboardingEmailTemplate } from '@/types/hrm';

// The single `onboarding_email_template` row (RLS `oet_admin`: admin-only, which
// is fine — only the admin settings surface reads it). Mapped onto the camelCase
// domain type the editor form and preview consume.
const fetchOnboardingEmailTemplate = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('onboarding_email_template')
    .select('subject, body_html')
    .eq('id', true)
    .single();
  if (error) throw new Error(error.message);
  return {
    subject: data.subject,
    bodyHtml: data.body_html,
  } satisfies OnboardingEmailTemplate;
});

/** The one reusable invitation email (PRD §6.4), backed by the
 *  `onboarding_email_template` singleton. Saving invalidates this key (see
 *  `use-update-onboarding-email-template`). */
export const useOnboardingEmailTemplate = () =>
  useQuery({
    queryKey: [QueryKeys.ONBOARDING_EMAIL_TEMPLATE],
    queryFn: () => fetchOnboardingEmailTemplate(),
  });
