import { Mail } from 'lucide-react';

import { EmptyState } from '@/components/hrm/empty-state';

/** Placeholder for the Onboarding Email tab. The rich-text (CKEditor) email
 *  template editor is an M3.4 deliverable that isn't built yet; this tab is
 *  wired so that editor drops straight in here once it lands — M4 does not
 *  rebuild it. */
export function OnboardingEmailPlaceholder() {
  return (
    <div className='max-w-2xl'>
      <EmptyState
        icon={Mail}
        title='Onboarding email editor coming soon'
        description='The onboarding email template editor (M3.4) will live here once it ships. There is nothing to configure yet.'
      />
    </div>
  );
}
