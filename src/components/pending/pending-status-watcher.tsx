'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { usePendingAccountStatus } from '@/hooks/queries/onboarding';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { paths } from '@/constants/paths';

import { type AccountStatus } from '@/types/hrm';

/** Where a no-longer-`submitted` employee belongs once an admin has decided:
 *  approved (active) opens the app; returned (onboarding) sends them back to
 *  re-upload and resubmit. `submitted` keeps them waiting. */
function destinationFor(
  status: AccountStatus | null | undefined,
): string | null {
  if (status === 'active') return paths.employee.dashboard;
  if (status === 'onboarding' || status === 'invited') {
    return paths.employee.onboarding;
  }
  return null;
}

/**
 * Watches the caller's account_status while they wait on the pending page. The
 * middleware funnel routes off the JWT's `app_metadata.account_status`, which
 * stays stale after an admin's decision until the token is refreshed — so a
 * plain page refresh keeps the employee stuck here. When the polled status
 * changes, this mints a fresh session (picking up the mirror-trigger's updated
 * app_metadata) and routes the employee to where they now belong. Renders
 * nothing.
 */
export function PendingStatusWatcher() {
  const router = useRouter();
  const { data: status } = usePendingAccountStatus();
  const redirecting = useRef(false);

  useEffect(() => {
    const destination = destinationFor(status);
    if (!destination || redirecting.current) return;
    redirecting.current = true;

    void (async () => {
      await createSupabaseBrowserClient().auth.refreshSession();
      router.replace(destination);
    })();
  }, [status, router]);

  return null;
}
