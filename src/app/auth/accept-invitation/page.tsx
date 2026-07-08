import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AcceptInvitationForm } from '@/components/auth/accept-invitation-form';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import { paths } from '@/constants/paths';

export const metadata: Metadata = { title: 'Accept invitation' };

/**
 * Reached after /auth/confirm verifies the invite token and establishes the
 * session. The employees row is the source of truth: only an `invited` caller
 * may set a password here. Anyone already onboarding/active is routed into the
 * app instead — so a signed-in admin can never land on this screen (and can't
 * overwrite their own password through it).
 */
export default async function AcceptInvitationPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(paths.auth.login);

  const { data: employee } = await supabase
    .from('employees')
    .select('email, account_status')
    .eq('id', user.id)
    .maybeSingle();

  if (!employee) redirect(paths.auth.login);
  if (employee.account_status === 'onboarding') {
    redirect(paths.employee.onboarding);
  }
  if (employee.account_status !== 'invited') {
    redirect(paths.employee.dashboard);
  }

  return <AcceptInvitationForm email={employee.email} />;
}
