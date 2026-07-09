'use client';

import { FileText } from 'lucide-react';
import { toast } from 'sonner';

type ProofFilesListProps = {
  files: string[];
};

/** Lists a claim's attached proof files. Uploads aren't wired up to real
 *  storage yet, so opening a file is a stub rather than a broken link. */
export function ProofFilesList({ files }: ProofFilesListProps) {
  if (!files.length) {
    return <p className='text-sm text-muted-foreground'>No files attached.</p>;
  }

  return (
    <ul className='flex flex-col gap-1'>
      {files.map((file) => (
        <li key={file}>
          <button
            type='button'
            onClick={() =>
              toast.info(
                "Preview isn't available yet — this will open the stored file once uploads are wired up to Supabase Storage.",
              )
            }
            className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground'
          >
            <FileText
              className='size-4 shrink-0 text-muted-foreground'
              aria-hidden
            />
            <span className='truncate'>{file}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
