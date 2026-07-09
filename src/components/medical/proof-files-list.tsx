import { FileText } from 'lucide-react';

type ProofFilesListProps = {
  files: string[];
};

/** Lists a claim's attached proof files. Uploads aren't wired up to real
 *  storage yet, so every file opens the same placeholder PDF — this stands
 *  in for what a real file link will do once storage is wired up. */
export function ProofFilesList({ files }: ProofFilesListProps) {
  if (!files.length) {
    return <p className='text-sm text-muted-foreground'>No files attached.</p>;
  }

  return (
    <div className='flex flex-col gap-1.5'>
      <ul className='flex flex-col gap-1'>
        {files.map((file) => (
          <li key={file}>
            <a
              href='/mock-documents/mock-proof.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
            >
              <FileText
                className='size-4 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <span className='truncate'>{file}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className='px-2 text-xs text-muted-foreground'>
        Placeholder preview — real files link here once uploads are wired up to
        storage.
      </p>
    </div>
  );
}
