'use client';

import { FileText } from 'lucide-react';

import { type IdentityDocFile } from '@/hooks/queries/onboarding';

import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

type DocumentPreviewProps = {
  file?: IdentityDocFile;
  /** Accessible label / alt text for the document. */
  label: string;
  isLoading?: boolean;
  className?: string;
};

const BOX = 'h-40 w-full overflow-hidden rounded-md border border-border bg-muted/30';

/**
 * Renders a preview of an uploaded identity document from a signed URL: an
 * inline image for PNGs and an embedded viewer (with a "View PDF" fallback) for
 * PDFs. Clicking opens the full document in a new tab. Returns nothing until a
 * file exists, so callers can render it unconditionally.
 */
export function DocumentPreview({
  file,
  label,
  isLoading,
  className,
}: DocumentPreviewProps) {
  if (isLoading) {
    return <Skeleton className={cn('h-40 w-full rounded-md', className)} />;
  }
  if (!file?.url) return null;

  if (file.mimeType.includes('pdf')) {
    return (
      <div className={cn(BOX, className)}>
        <object
          data={file.url}
          type='application/pdf'
          className='h-full w-full'
          aria-label={label}
        >
          <a
            href={file.url}
            target='_blank'
            rel='noreferrer'
            className='flex h-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground'
          >
            <FileText className='size-4' aria-hidden />
            View PDF
          </a>
        </object>
      </div>
    );
  }

  return (
    <a
      href={file.url}
      target='_blank'
      rel='noreferrer'
      className={cn(BOX, 'block hover:bg-muted/50', className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- private signed Supabase URL, not a static asset; the Next image optimizer must not proxy/cache identity documents */}
      <img
        src={file.url}
        alt={label}
        className='h-full w-full object-contain'
      />
    </a>
  );
}
