'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { usePolicies } from '@/hooks/queries/policies';

import { ImportPdfButton } from '@/components/policies/import-pdf-button';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ControlledRichText } from '@/components/ui/form/controlled-rich-text';
import { ControlledSelect } from '@/components/ui/form/controlled-select';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { policyCategoryLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';
import { type CreatePolicyInput, createPolicySchema } from '@/schema/policy';

import { Policy } from '@/types/hrm';

const categoryOptions = Object.entries(policyCategoryLabels).map(
  ([value, label]) => ({ value, label }),
);

type CreatePolicyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreatePolicyDialog({
  open,
  onOpenChange,
}: CreatePolicyDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: policies } = usePolicies();
  // CKEditor only reads its `data` prop on mount, so a PDF import has to
  // force a fresh mount for the imported content to appear.
  const [editorKey, setEditorKey] = useState(0);

  const form = useForm<CreatePolicyInput>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: { title: '', category: 'general', contentHtml: '' },
  });

  const handlePdfImported = (html: string, fileName: string) => {
    form.setValue('contentHtml', html, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (!form.getValues('title')) {
      form.setValue('title', fileName.replace(/[-_]+/g, ' ').trim());
    }
    setEditorKey((key) => key + 1);
  };

  const onSubmit = (values: CreatePolicyInput) => {
    const id = `pol-${Date.now()}`;
    const newPolicy: Policy = {
      id,
      title: values.title,
      category: values.category,
      versions: [
        {
          version: 1,
          contentHtml: values.contentHtml,
          publishedAt: new Date().toISOString().slice(0, 10),
        },
      ],
    };

    queryClient.setQueryData<Policy[]>([QueryKeys.POLICIES], (old) => [
      ...(old ?? policies ?? []),
      newPolicy,
    ]);

    toast.success(`${values.title} published`);
    onOpenChange(false);
    form.reset();
    router.push(paths.admin.policyDetail(id));
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      <SheetContent className='flex w-full flex-col gap-6 overflow-y-auto sm:max-w-xl'>
        <SheetHeader>
          <SheetTitle>New policy</SheetTitle>
          <SheetDescription>
            Employees will be able to view this as soon as it's published.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex min-h-0 flex-1 flex-col gap-4'
          >
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Remote Work Policy' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ControlledSelect<CreatePolicyInput>
                name='category'
                label='Category'
                options={categoryOptions}
                placeholder='Select category'
              />
            </div>
            <div className='flex justify-end'>
              <ImportPdfButton onImported={handlePdfImported} />
            </div>
            <ControlledRichText<CreatePolicyInput>
              key={editorKey}
              name='contentHtml'
              label='Content'
              containerClassName='flex min-h-0 flex-1 flex-col'
              editorClassName='rich-text-editor--fill flex min-h-0 flex-1 flex-col'
            />
            <SheetFooter className='mt-auto'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={form.formState.isSubmitting}>
                Publish
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
