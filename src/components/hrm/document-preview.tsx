'use client';

import { ExternalLink } from 'lucide-react';

import { type IdentityDocFile } from '@/hooks/queries/onboarding';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

type DocumentPreviewProps = {
  file?: IdentityDocFile;
  /** Accessible label / alt text for the document. */
  label: string;
  isLoading?: boolean;
  className?: string;
};

// A fixed, well-proportioned frame. Content is *fitted* inside it (never cropped
// or scrolled): images via object-contain, PDFs via the viewer's `view=Fit`.
const FRAME =
  'relative flex h-56 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30';

/**
 * Shows an uploaded identity document fitted whole into a fixed frame — no
 * cropping, no scrolling. Images render with object-contain; PDFs embed the
 * first page fitted to the frame with the viewer's toolbar/scrollbars hidden,
 * plus an "Open" affordance for the full document. Renders nothing until a file
 * exists, so callers can drop it in unconditionally.
 */
export function DocumentPreview({
  file,
  label,
  isLoading,
  className,
}: DocumentPreviewProps) {
  if (isLoading) {
    return <Skeleton className={cn('h-56 w-full rounded-lg', className)} />;
  }
  if (!file?.url) return null;

  if (file.mimeType.includes('pdf')) {
    return (
      <div className={cn(FRAME, className)}>
        <iframe
          title={label}
          // Fit the whole page to the frame and hide the viewer chrome so the
          // preview shows the document, not a scrollable mini-app.
          src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
          className='h-full w-full'
        />
        <Button
          asChild
          size='sm'
          variant='secondary'
          className='absolute bottom-2 right-2 gap-1.5 shadow-sm'
        >
          <a href={file.url} target='_blank' rel='noreferrer'>
            <ExternalLink />
            Open
          </a>
        </Button>
      </div>
    );
  }

  return (
    <a
      href={file.url}
      target='_blank'
      rel='noreferrer'
      className={cn(FRAME, 'transition-colors hover:bg-muted/50', className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- private signed Supabase URL, not a static asset; the Next image optimizer must not proxy/cache identity documents */}
      <img
        src={file.url}
        alt={label}
        className='max-h-full max-w-full object-contain'
      />
    </a>
  );
}
