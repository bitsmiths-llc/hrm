import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AcceptInvitationForm } from '@/components/auth/accept-invitation-form';
import { InviteTokenVerifier } from '@/components/auth/invite-token-verifier';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import { paths } from '@/constants/paths';

export const metadata: Metadata = { title: 'Accept invitation' };

type SearchParams = Promise<{ token_hash?: string; type?: string }>;

/**
 * Landing screen for the emailed invitation link, and the trust anchor of the
 * invite flow. The link points straight here with `?token_hash=&type=` (there is
 * no /auth/confirm hop).
 *
 * Identity trust chain — the email address is never taken from the URL:
 *  1. `getUser()` is the authority. If a verified session already exists it wins
 *     outright; the token in the URL is ignored (it can only ever *bootstrap* a
 *     session, never override one). So a signed-in admin who clicks an invite is
 *     routed to their own app, never onto this form as someone else.
 *  2. No session yet (a private tab, a different browser, a fresh device) →
 *     <InviteTokenVerifier> exchanges the one-time token for a session on the
 *     client, strips the token from the URL, and re-renders here with the
 *     session in place. This is the "private-tab re-verification" path.
 *  3. With a session, the `employees` row keyed by `user.id` is the source of
 *     truth for who they are (email) and what they may do: only an `invited`
 *     caller sees the password form; onboarding/active callers are routed on.
 *
 * The URL contributes an opaque token that must survive `verifyOtp`; it never
 * contributes identity. Expired/reused tokens fail that exchange and are handled
 * by <InviteTokenVerifier>.
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
