import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AcceptInvitationForm } from '@/components/auth/accept-invitation-form';
import { InviteTokenVerifier } from '@/components/auth/invite-token-verifier';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import { paths } from '@/constants/paths';

export const metadata: Metadata = { title: 'Accept invitation' };

type SearchParams = Promise<{ token_hash?: string; type?: string }>;

/**
 * Landing screen for the emailed invitation link. The link points straight here
 * with `?token_hash=&type=` (there is no /auth/confirm hop): when no session
 * exists yet, <InviteTokenVerifier> exchanges the token for a session on the
 * client, then strips it from the URL and re-renders this page with the session
 * in place.
 *
 * Once a session exists the employees row is the source of truth: only an
 * `invited` caller may set a password here. Anyone already onboarding/active is
 * routed into the app instead — so a signed-in admin can never land on this
 * screen (and can't overwrite their own password through it).
 */
export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session yet: exchange the emailed token on the client (a server component
  // can't write the session cookies). With no token present this is a stray
  // visit, so send them to sign in.
  if (!user) {
    const { token_hash: tokenHash, type } = await searchParams;
    if (tokenHash && type) {
      return <InviteTokenVerifier tokenHash={tokenHash} type={type} />;
    }
    redirect(paths.auth.login);
  }

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
