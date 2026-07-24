'use client';

import { Megaphone, X } from 'lucide-react';
import { useState } from 'react';

import { usePendingAcknowledgments } from '@/hooks/queries/policies';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * A simple employee dashboard banner for outstanding policy acknowledgments.
 * The banner can be dismissed until the page reloads, but it otherwise stays
 * attached to the current live count.
 */
export function ReackPrompt() {
  const { data: pending, isLoading } = usePendingAcknowledgments();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading) return <Skeleton className='h-24 rounded-xl' />;

  if (!pending.length || dismissed) {
    return null;
  }

  return (
    <Card className='border-amber-500/40 bg-amber-500/5'>
      <CardContent className='flex items-center justify-between gap-3 p-4'>
        <div className='flex items-start gap-3'>
          <Megaphone
            className='mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400'
            aria-hidden
          />
          <div>
            <p className='text-sm font-medium'>
              {pending.length === 1
                ? '1 policy needs your acknowledgment.'
                : `${pending.length} policies need your acknowledgment.`}
            </p>
            <p className='text-xs text-muted-foreground'>
              Read the policies from your Policies page.
            </p>
          </div>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='text-muted-foreground hover:text-foreground'
          onClick={() => setDismissed(true)}
          aria-label='Dismiss announcement'
        >
          <X className='size-4' />
        </Button>
      </CardContent>
    </Card>
  );
}
