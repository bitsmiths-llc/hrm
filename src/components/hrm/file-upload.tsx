'use client';

import { FileText, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { formatNumber } from '@/utils/number-functions';

type FileUploadProps = {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  /** Passed to the native input, e.g. 'image/*,.pdf'. */
  accept?: string;
  label?: string;
};

export function FileUpload({
  value,
  onChange,
  maxFiles = 5,
  maxSizeMb = 10,
  accept,
  label = 'Upload files',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (selected: FileList | null) => {
    if (!selected?.length) return;

    const incoming = Array.from(selected);
    const oversized = incoming.filter(
      (file) => file.size > maxSizeMb * 1024 * 1024,
    );
    if (oversized.length) {
      toast.error(
        `Each file must be under ${maxSizeMb}MB: ${oversized
          .map((f) => f.name)
          .join(', ')}`,
      );
      return;
    }

    const next = [...value, ...incoming];
    if (next.length > maxFiles) {
      toast.error(`You can attach up to ${maxFiles} files.`);
      return;
    }

    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className='flex flex-col gap-2'>
      <input
        ref={inputRef}
        type='file'
        multiple
        accept={accept}
        className='sr-only'
        onChange={(e) => {
          handleSelect(e.target.files);
          e.target.value = '';
        }}
      />
      <Button
        type='button'
        variant='outline'
        iconLeft={Upload}
        onClick={() => inputRef.current?.click()}
        disabled={value.length >= maxFiles}
      >
        {label}
      </Button>
      <p className='text-xs text-muted-foreground'>
        Up to {maxFiles} files, {maxSizeMb}MB each
      </p>
      {value.length > 0 && (
        <ul className='flex flex-col gap-1'>
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className='flex items-center gap-2 rounded-md border border-border px-3 py-2'
            >
              <FileText
                className='size-4 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <span className='flex-1 truncate text-sm'>{file.name}</span>
              <span className='shrink-0 text-xs text-muted-foreground'>
                {formatNumber(file.size / 1024)} KB
              </span>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7'
                aria-label={`Remove ${file.name}`}
                onClick={() => removeAt(index)}
              >
                <X className='size-4' aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
