'use client';

import { format } from 'date-fns';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  createExportSignedUrl,
  useRunExports,
} from '@/hooks/queries/payroll-exports';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { downloadUrl } from '@/utils/download-functions';

type ExportArtifactsProps = { runId: string };

/** The list of Payoneer files generated for a locked run, with download links.
 *  URLs are minted per click (fresh signed URL), gated by the admin storage
 *  policy. Renders nothing until at least one export exists. */
export function ExportArtifacts({ runId }: ExportArtifactsProps) {
  const { data: exports, isLoading } = useRunExports(runId);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string, filePath: string) => {
    setDownloadingId(id);
    try {
      const url = await createExportSignedUrl(filePath);
      downloadUrl(url, filePath.split('/').pop() ?? 'payoneer-export.xlsx');
    } catch (error) {
      toast.error('Could not open export', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) return <Skeleton className='h-16 rounded-lg' />;
  if (!exports?.length) return null;

  return (
    <div className='rounded-lg border border-border'>
      <p className='border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
        Payoneer exports
      </p>
      <ul className='divide-y divide-border'>
        {exports.map((item) => (
          <li
            key={item.id}
            className='flex items-center justify-between gap-3 px-4 py-2.5'
          >
            <span className='flex min-w-0 items-center gap-2'>
              <FileSpreadsheet className='size-4 shrink-0 text-muted-foreground' />
              <span className='flex min-w-0 flex-col'>
                <span className='truncate text-sm font-medium'>
                  {item.filePath.split('/').pop()}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {format(item.exportedAt, 'd MMM yyyy, h:mm a')}
                  {item.exportedByName ? ` · ${item.exportedByName}` : ''}
                </span>
              </span>
            </span>
            <Button
              variant='ghost'
              size='sm'
              iconLeft={Download}
              isLoading={downloadingId === item.id}
              disabled={!item.filePath}
              onClick={() => handleDownload(item.id, item.filePath)}
            >
              Download
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
