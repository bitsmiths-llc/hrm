'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { FileUpload } from '@/components/hrm/file-upload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { QueryKeys } from '@/constants/query-keys';

import { EmployeeContract } from '@/types/hrm';

type UploadContractDialogProps = {
  employeeId: string;
  currentVersion: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UploadContractDialog({
  employeeId,
  currentVersion,
  open,
  onOpenChange,
}: UploadContractDialogProps) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!files.length) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    queryClient.setQueryData<EmployeeContract[]>(
      [QueryKeys.CONTRACTS],
      (old) => {
        const existing = old ?? [];
        const hasRecord = existing.some((c) => c.employeeId === employeeId);
        const newVersion = {
          version: currentVersion + 1,
          fileName: files[0].name,
          uploadedAt: new Date().toISOString().slice(0, 10),
          note: note.trim() || null,
        };
        if (!hasRecord) {
          return [...existing, { employeeId, versions: [newVersion] }];
        }
        return existing.map((c) =>
          c.employeeId === employeeId
            ? { ...c, versions: [...c.versions, newVersion] }
            : c,
        );
      },
    );

    toast.success('Contract uploaded');
    setSubmitting(false);
    setFiles([]);
    setNote('');
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setFiles([]);
          setNote('');
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload contract</DialogTitle>
          <DialogDescription>
            This replaces the current contract. The previous version stays in
            history.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <FileUpload
            value={files}
            onChange={setFiles}
            maxFiles={1}
            accept='.pdf'
            label='Upload PDF'
          />
          <div className='flex flex-col gap-2'>
            <Label htmlFor='contract-note'>Note (optional)</Label>
            <Input
              id='contract-note'
              placeholder='e.g. Annual renewal'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            disabled={!files.length}
            isLoading={submitting}
            onClick={handleSubmit}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
