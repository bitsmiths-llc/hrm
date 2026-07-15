import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { RecoveryTokenVerifier } from '@/components/auth/recovery-token-verifier';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import { paths } from '@/constants/paths';

export const metadata: Metadata = { title: 'Set a new password' };

type SearchParams = Promise<{ token_hash?: string; type?: string }>;

/**
 * Landing screen for the emailed recovery link. The link (minted by
 * `requestPasswordReset` and delivered via Resend) points straight here with
 * `?token_hash=&type=recovery`.
 *
 * Mirrors the invite-acceptance gate — identity is session-bound, never
 * URL-derived:
 *  1. A verified session already exists → show the form. This is both the
 *     re-render after the token is exchanged (a recovery session) and the case
 *     of an already-signed-in user changing their password.
 *  2. No session yet, but a recovery token is present → <RecoveryTokenVerifier>
 *     exchanges the one-time token for a recovery session on the client, strips
 *     the token from the URL, and re-renders here down branch 1.
 *  3. No session and no token → a stray visit; send them to sign in, where
 *     "Forgot password?" can mint a fresh link.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { token_hash: tokenHash, type } = await searchParams;
    if (tokenHash && type === 'recovery') {
      return <RecoveryTokenVerifier tokenHash={tokenHash} />;
    }
    redirect(paths.auth.login);
  }

  return <ResetPasswordForm />;
}
