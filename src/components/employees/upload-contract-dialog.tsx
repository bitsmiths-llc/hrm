'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUploadContract } from '@/hooks/actions/use-upload-contract';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { hrmConfig } from '@/constants/hrm-config';
import {
  type UploadContractFormInput,
  uploadContractFormSchema,
} from '@/schema/contract';

const CONTRACT_ACCEPT = hrmConfig.contractMimeTypes.join(',');

type UploadContractDialogProps = {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UploadContractDialog({
  employeeId,
  open,
  onOpenChange,
}: UploadContractDialogProps) {
  const form = useForm<UploadContractFormInput>({
    resolver: zodResolver(uploadContractFormSchema),
    defaultValues: { files: [], note: '' },
  });

  const { mutate, isPending } = useUploadContract(employeeId, () => {
    toast.success('Contract uploaded');
    form.reset();
    onOpenChange(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload contract</DialogTitle>
          <DialogDescription>
            This becomes the employee&apos;s current contract. The previous
            version stays in history.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutate(values))}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='files'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signed contract</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={1}
                      maxSizeMb={hrmConfig.maxContractFileSizeMb}
                      accept={CONTRACT_ACCEPT}
                      allowedMimeTypes={hrmConfig.contractMimeTypes}
                      label='Upload PDF'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Annual renewal' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={isPending}>
                Upload
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
