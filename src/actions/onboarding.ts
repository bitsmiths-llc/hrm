'use server';

import { authActionClient } from '@/lib/server/safe-action';

import { acceptInvitationSchema } from '@/schema/auth';

/**
 * Invite-link landing. The invitee arrives already in a Supabase session
 * established by the emailed link (verified via /auth/callback). They set a
 * password — which signs them in for good — and then advance their own row
 * `invited → onboarding` via the caller-only `accept_onboarding()` RPC.
 *
 * The action runs as the caller (RLS + RPC), never service-role:
 * `accept_onboarding()` is security-definer and self-scoped, so it can only
 * advance the caller's own invite and only from the `invited` state.
 */
export const acceptInvite = authActionClient
  .schema(acceptInvitationSchema)
  .action(async ({ parsedInput: { password }, ctx: { supabase } }) => {
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });
    if (passwordError) {
      throw new Error(
        'Could not set your password. The invitation link may have expired — ask your admin to resend it.',
      );
    }

    const { error: rpcError } = await supabase.rpc('accept_onboarding');
    if (rpcError) {
      throw new Error('Could not complete your invitation. Please try again.');
    }
  });
