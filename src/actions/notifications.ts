'use server';

import { z } from 'zod';

import { authActionClient } from '@/lib/server/safe-action';

import { markReadSchema } from '@/schema/notification';

/**
 * Mark one of the caller's notifications read (BIT-26).
 *
 * Self-scoped in two independent places: RLS `notif_update_own` is the real
 * boundary (it scopes any update to `recipient_id = auth.uid()`), and the
 * `recipient_id` filter here is belt-and-suspenders. The `read_at is null`
 * guard makes a repeat click a no-op rather than re-stamping the timestamp.
 */
export const markNotificationRead = authActionClient
  .schema(markReadSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const recipientId = authUser.user?.id;
    if (!recipientId) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', parsedInput.id)
      .eq('recipient_id', recipientId)
      .is('read_at', null);
    if (error) throw new Error(error.message);

    return { success: true };
  });

/**
 * Mark every unread notification for the caller read (the "Mark all read"
 * action). Scoped to the caller's own rows only — RLS plus the explicit
 * `recipient_id` filter — so it never touches another user's feed.
 */
export const markAllRead = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx: { supabase, authUser } }) => {
    const recipientId = authUser.user?.id;
    if (!recipientId) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', recipientId)
      .is('read_at', null);
    if (error) throw new Error(error.message);

    return { success: true };
  });
