'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  useMarkAllRead,
  useMarkNotificationRead,
} from '@/hooks/actions/use-mark-notification-read';
import { useNotifications, useUnreadCount } from '@/hooks/queries/notifications';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

import { Notification } from '@/types/hrm';

/** Badges beyond 9 collapse to "9+" so the count never widens the bell. */
const formatBadge = (count: number) => (count > 9 ? '9+' : String(count));

/**
 * The employee-shell notification bell (BIT-26). Shows an unread-count badge and
 * a dropdown feed (newest first); clicking a notification navigates to its
 * `link` and marks it read, and "Mark all read" clears the caller's count.
 *
 * The unread count comes from its own `head` count query (accurate even past the
 * 50-row feed cap); the per-row unread dot comes from each row's `readAt`.
 */
export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: notifications, isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const handleSelect = (notification: Notification) => {
    if (!notification.readAt) markRead.execute({ id: notification.id });
    setOpen(false);
    if (notification.link) router.push(notification.link);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='relative'
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
        >
          <Bell className='size-5' />
          {unreadCount > 0 && (
            <span
              aria-hidden
              className='absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground'
            >
              {formatBadge(unreadCount)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0'>
        <div className='flex items-center justify-between border-b border-border px-3 py-2'>
          <p className='text-sm font-semibold'>Notifications</p>
          <Button
            variant='link'
            size='sm'
            className='h-auto p-0 text-xs'
            disabled={unreadCount === 0 || markAll.isPending}
            onClick={() => markAll.execute({})}
          >
            Mark all read
          </Button>
        </div>

        <div className='max-h-80 overflow-y-auto'>
          {isLoading ? (
            <div className='flex flex-col gap-2 p-3'>
              <Skeleton className='h-12 rounded-md' />
              <Skeleton className='h-12 rounded-md' />
              <Skeleton className='h-12 rounded-md' />
            </div>
          ) : !notifications?.length ? (
            <p className='px-3 py-8 text-center text-sm text-muted-foreground'>
              No notifications yet.
            </p>
          ) : (
            <ul className='flex flex-col divide-y divide-border'>
              {notifications.map((notification) => {
                const isUnread = !notification.readAt;
                return (
                  <li key={notification.id}>
                    <button
                      type='button'
                      onClick={() => handleSelect(notification)}
                      className={cn(
                        'flex w-full gap-2 px-3 py-2.5 text-left transition-colors hover:bg-accent',
                        isUnread && 'bg-primary/5',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'mt-1.5 size-2 shrink-0 rounded-full',
                          isUnread ? 'bg-primary' : 'bg-transparent',
                        )}
                      />
                      <span className='flex min-w-0 flex-col gap-0.5'>
                        <span className='truncate text-sm font-medium'>
                          {notification.title}
                        </span>
                        {notification.body && (
                          <span className='line-clamp-2 text-xs text-muted-foreground'>
                            {notification.body}
                          </span>
                        )}
                        <span className='text-xs text-muted-foreground'>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
