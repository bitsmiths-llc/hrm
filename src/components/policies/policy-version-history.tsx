'use client';

import { format } from 'date-fns';
import { Eye, History } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { PolicyContent } from './policy-content';

import { PolicyVersion } from '@/types/hrm';

type PolicyVersionHistoryProps = {
  versions: PolicyVersion[];
  currentVersionNumber: number;
  /** Omit to hide the revert action (e.g. read-only contexts). */
  onRevert?: (version: PolicyVersion) => void;
};

export function PolicyVersionHistory({
  versions,
  currentVersionNumber,
  onRevert,
}: PolicyVersionHistoryProps) {
  const newestFirst = [...versions].reverse();
  const [viewing, setViewing] = useState<PolicyVersion | null>(null);

  return (
    <>
      <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
        {newestFirst.map((version) => (
          <li
            key={version.version}
            className='flex items-center justify-between gap-3 px-4 py-3'
          >
            <span className='text-sm font-medium'>
              Version {version.version}
              {version.version === currentVersionNumber && ' (current)'}
            </span>
            <div className='flex items-center gap-3'>
              <span className='text-xs text-muted-foreground'>
                {format(version.publishedAt, 'MMM d, yyyy')}
              </span>
              {version.version !== currentVersionNumber && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='size-7'
                      onClick={() => setViewing(version)}
                      aria-label={`View version ${version.version}`}
                    >
                      <Eye className='size-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View this version</TooltipContent>
                </Tooltip>
              )}
              {!!onRevert && version.version !== currentVersionNumber && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='size-7'
                      onClick={() => onRevert(version)}
                      aria-label={`Revert to version ${version.version}`}
                    >
                      <History className='size-3.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Revert to this version</TooltipContent>
                </Tooltip>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Sheet
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <SheetContent className='flex w-full flex-col gap-6 overflow-y-auto sm:max-w-xl'>
          {!!viewing && (
            <>
              <SheetHeader>
                <SheetTitle>Version {viewing.version}</SheetTitle>
                <SheetDescription>
                  Published {format(viewing.publishedAt, 'MMM d, yyyy')} · this
                  is an older version, shown read-only.
                </SheetDescription>
              </SheetHeader>
              <PolicyContent html={viewing.contentHtml} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
