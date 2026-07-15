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

type RecoveryTokenVerifierProps = {
  tokenHash: string;
};

/**
 * Client half of the password-reset landing — the recovery counterpart to
 * `InviteTokenVerifier`.
 *
 * The reset page renders this only when there is NO session yet, so the emailed
 * `?token_hash=&type=recovery` is the sole proof of identity. A server component
 * can't write the auth cookies, so the token is exchanged here on the browser
 * client. On success a recovery session is established and we replace the URL
 * with a clean `/auth/reset-password` — the re-render reads the session (not the
 * URL) and shows the "set a new password" form, and the token no longer lingers
 * in the address bar or history.
 *
 * Expired / already-used / malformed tokens can't be exchanged. Rather than
 * bounce silently, we surface an explicit "link no longer valid" state that
 * points the user back to request a fresh reset link.
 */
export function RecoveryTokenVerifier({
  tokenHash,
}: RecoveryTokenVerifierProps) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  // The recovery token is one-time; guard against a double-run (React strict
  // mode) spending it twice — the second verify would fail and strand a valid
  // user on the error state.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    void (async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      });

      if (error) {
        // Expired or already-consumed token. If the caller somehow already holds
        // a valid session, don't strand them — let the reset form load so they
        // can change their password. Otherwise there's no way in from this link.
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          router.replace(paths.auth.resetPassword);
        } else {
          setFailed(true);
        }
        return;
      }

      // Success: recovery-session cookies are set. Replace (not push) so the
      // token never lingers in history; the clean re-render lands on the form.
      router.replace(paths.auth.resetPassword);
    })();
  }, [router, tokenHash]);

  if (failed) {
    return (
      <Card>
        <CardHeader className='items-center text-center'>
          <MailWarning className='size-8 text-muted-foreground' aria-hidden />
          <CardTitle className='text-xl font-semibold'>
            This reset link is no longer valid
          </CardTitle>
          <CardDescription>
            Password reset links can be opened once and expire after a while.
            Request a new one and open the newest link.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <Link href={paths.auth.forgotPassword}>
            <Button variant='outline'>Request a new link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='flex min-h-40 items-center justify-center text-sm text-muted-foreground'>
      Verifying your reset link…
    </div>
  );
}
