'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

/**
 * Landing target for the default Supabase invite email. That template can only
 * be pointed at /auth/confirm once custom SMTP is enabled, so on the built-in
 * mailer the link returns via the implicit flow with the session in the URL
 * hash — which only the browser can read. The client runs the PKCE flow and
 * won't auto-detect an implicit hash, so we parse the tokens and call
 * setSession explicitly, which persists the cookie session; then we forward to
 * the set-password page. (With custom SMTP + a token_hash template,
 * /auth/confirm handles this server-side instead.)
 */
export default function InviteCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));

    // An expired/invalid link comes back as an error in the hash, not tokens.
    if (hashParams.get('error')) {
      setStatus('error');
      return;
    }

    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    if (!accessToken || !refreshToken) {
      setStatus('error');
      return;
    }

    // Establish the session explicitly from the link's tokens (the PKCE client
    // won't auto-detect an implicit hash). setSession writes the cookie session
    // the set-password page reads server-side, then we forward there.
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) setStatus('error');
        else router.replace(paths.auth.acceptInvitation);
      });
  }, [router]);

  if (status === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-xl font-semibold'>Link expired</CardTitle>
          <CardDescription>
            This invitation link is invalid or has expired. Ask your admin to
            send a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className='w-full'
            onClick={() => router.replace(paths.auth.login)}
          >
            Go to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>Signing you in…</CardTitle>
        <CardDescription>
          Hold on while we verify your invitation.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex justify-center py-6'>
        <Loader2 className='size-6 animate-spin text-muted-foreground' />
      </CardContent>
    </Card>
  );
}
