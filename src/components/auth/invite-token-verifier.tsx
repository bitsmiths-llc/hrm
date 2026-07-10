'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase/client';

import { paths } from '@/constants/paths';

// OTP link types that reach the invite-acceptance flow: a first-time `invite`,
// or a `magiclink` minted by Resend on re-invite. Anything else is an invalid
// link. The tuple doubles as a runtime allowlist and the literal type for
// verifyOtp — both are assignable to Supabase's EmailOtpType.
const ACCEPTED_TYPES = ['invite', 'magiclink'] as const;
type AcceptedType = (typeof ACCEPTED_TYPES)[number];

type InviteTokenVerifierProps = {
  tokenHash: string;
  type: string;
};

/**
 * Client half of the invite landing (replaces the old /auth/confirm route).
 * A server component can't write the auth cookies, so the emailed
 * `?token_hash=&type=` is exchanged for a session here on the browser client,
 * then the URL is replaced with a clean `/auth/accept-invitation` — dropping the
 * token from the address bar/history and re-rendering the page, which now sees
 * the session and shows the password form. A spent/expired/invalid token can't
 * be verified, so we route to sign in (the same outcome /auth/confirm gave).
 */
export function InviteTokenVerifier({
  tokenHash,
  type,
}: InviteTokenVerifierProps) {
  const router = useRouter();
  // The invite token is one-time; guard against a double-run (React strict mode)
  // spending it twice — the second verify would fail and bounce a valid invitee.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const otpType = ACCEPTED_TYPES.find((t) => t === type) as
      | AcceptedType
      | undefined;
    if (!otpType) {
      router.replace(paths.auth.login);
      return;
    }

    void (async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });
      // Replace (not push) either way so the token never lingers in history.
      // On success the cookies are now set, so the re-render lands on the form.
      router.replace(error ? paths.auth.login : paths.auth.acceptInvitation);
    })();
  }, [router, tokenHash, type]);

  return (
    <div className='flex min-h-40 items-center justify-center text-sm text-muted-foreground'>
      Verifying your invitation…
    </div>
  );
}
