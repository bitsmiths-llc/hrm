'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { markAllRead, markNotificationRead } from '@/actions/notifications';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Invalidate both notification queries — the feed (so the read row loses its
 *  unread dot) and the badge count. The bell lives in the persistent shell, so
 *  neither mark-read action unmounts it and `onSuccess` fires reliably. */
const invalidateNotifications = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: [QueryKeys.NOTIFICATIONS] });
  queryClient.invalidateQueries({ queryKey: [QueryKeys.NOTIFICATIONS_UNREAD] });
};

/** Mark a single notification read — fired when the recipient clicks it in the
 *  dropdown (alongside navigating to its link). */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useAction(markNotificationRead, {
    onSuccess: () => invalidateNotifications(queryClient),
    onError,
  });
}

/** "Mark all read" — clears the caller's unread count in one write. */
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useAction(markAllRead, {
    onSuccess: () => invalidateNotifications(queryClient),
    onError,
  });
}
