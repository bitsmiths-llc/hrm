'use client';

import { MailWarning } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
 * Client half of the invite landing (replaces the old /auth/confirm route) and
 * the token-exchange link in the identity trust chain.
 *
 * The server page renders this only when there is NO session yet (a private tab
 * or a fresh browser), so the emailed `?token_hash=&type=` is the sole proof of
 * identity available. A server component can't write the auth cookies, so the
 * token is exchanged here on the browser client. On success the session cookies
 * are set and we replace the URL with a clean `/auth/accept-invitation` — the
 * re-render now reads identity from the session (`getUser()` + `employees` row),
 * never from the URL, and the token no longer lingers in the address bar or
 * history.
 *
 * Expired / already-used / malformed tokens can't be exchanged. Rather than
 * bounce silently to sign-in (which leaves the invitee guessing), we surface an
 * explicit "link no longer valid" state that points them at their admin for a
 * fresh invite.
 */
export function InviteTokenVerifier({
  tokenHash,
  type,
}: InviteTokenVerifierProps) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
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
      // Malformed/tampered link — no valid token type to exchange.
      setFailed(true);
      return;
    }

    void (async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });

      if (error) {
        // Expired or already-consumed token. If the caller somehow already holds
        // a valid session (e.g. they accepted, then reopened the old email link),
        // don't strand them — let the server route them by their employees row.
        // Otherwise there's genuinely no way in from this link: show guidance.
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          router.replace(paths.auth.acceptInvitation);
        } else {
          setFailed(true);
        }
        return;
      }

      // Success: cookies are set. Replace (not push) so the token never lingers
      // in history; the clean re-render lands on the password form.
      router.replace(paths.auth.acceptInvitation);
    })();
  }, [router, tokenHash, type]);

  if (failed) {
    return (
      <Card>
        <CardHeader className='items-center text-center'>
          <MailWarning className='size-8 text-muted-foreground' aria-hidden />
          <CardTitle className='text-xl font-semibold'>
            This invitation link is no longer valid
          </CardTitle>
          <CardDescription>
            Invitation links can be opened once and expire after a while. Ask
            your admin to send you a fresh invite, then open the newest link.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <Link href={paths.auth.login}>
            <Button variant='outline'>Back to sign in</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='flex min-h-40 items-center justify-center text-sm text-muted-foreground'>
      Verifying your invitation…
    </div>
  );
}
