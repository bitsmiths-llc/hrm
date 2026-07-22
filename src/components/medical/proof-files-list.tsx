'use client';

import { FileText, Loader2 } from 'lucide-react';

import { useMedicalProofUrls } from '@/hooks/queries/medical';

type ProofFilesListProps = {
  /** Storage paths in the `medical-proofs` bucket. Signed on demand. */
  files: string[];
};

/** Lists a claim's attached proof files as short-lived signed-URL links. RLS on
 *  the bucket (medproofs_own / medproofs_admin) means an owner sees their own
 *  and an admin sees any. */
export function ProofFilesList({ files }: ProofFilesListProps) {
  const { data: proofs, isLoading, isError } = useMedicalProofUrls(files);

  if (!files.length) {
    return <p className='text-sm text-muted-foreground'>No files attached.</p>;
  }

  if (isLoading) {
    return (
      <p className='flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground'>
        <Loader2 className='size-4 animate-spin' aria-hidden />
        Loading proof files…
      </p>
    );
  }

  if (isError || !proofs?.length) {
    return (
      <p className='px-2 py-1.5 text-sm text-muted-foreground'>
        Couldn&apos;t load the proof files.
      </p>
    );
  }

  return (
    <ul className='flex flex-col gap-1'>
      {proofs.map((proof) => (
        <li key={proof.path}>
          <a
            href={proof.url}
            target='_blank'
            rel='noopener noreferrer'
            className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
          >
            <FileText
              className='size-4 shrink-0 text-muted-foreground'
              aria-hidden
            />
            <span className='truncate'>{proof.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
