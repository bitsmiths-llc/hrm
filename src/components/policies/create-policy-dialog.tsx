'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCreatePolicy } from '@/hooks/actions/use-manage-policies';

import { ImportPdfButton } from '@/components/policies/import-pdf-button';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  type CreatePolicyInput,
  createPolicySchema,
  slugify,
} from '@/schema/policy';

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
  const router = useRouter();
  // CKEditor only reads its `data` prop on mount, so a PDF import has to
  // force a fresh mount for the imported content to appear.
  const [editorKey, setEditorKey] = useState(0);

  const form = useForm<CreatePolicyInput>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: {
      title: '',
      slug: '',
      category: 'general',
      contentHtml: '',
    },
  });

  const { execute, isPending } = useCreatePolicy(
    (policyId) => {
      toast.success(`${form.getValues('title')} published`);
      onOpenChange(false);
      form.reset();
      router.push(paths.admin.policyDetail(policyId));
    },
    (message) => form.setError('slug', { message }),
  );

  /** The slug is derived from the title until the admin edits it themselves —
   *  after that it's theirs, since it's the key M3.5 maps to a rule. */
  const handleTitleChange = (title: string) => {
    form.setValue('title', title, { shouldDirty: true });
    if (!form.getFieldState('slug').isDirty) {
      form.setValue('slug', slugify(title), { shouldValidate: true });
    }
  };

  const handlePdfImported = (html: string, fileName: string) => {
    form.setValue('contentHtml', html, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (!form.getValues('title')) {
      handleTitleChange(fileName.replace(/[-_]+/g, ' ').trim());
    }
    setEditorKey((key) => key + 1);
  };

  const onSubmit = (values: CreatePolicyInput) => execute(values);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      {/* The sheet itself never scrolls — only the field area below does. A
          scrolling sheet put the footer out of reach: CKEditor's editable has
          its own overflow, so the wheel never bubbled up to move the sheet. */}
      <SheetContent className='flex w-full flex-col gap-6 overflow-hidden sm:max-w-xl'>
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
            <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Remote Work Policy'
                          {...field}
                          onChange={(event) =>
                            handleTitleChange(event.target.value)
                          }
                        />
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
              <FormField
                control={form.control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. remote-work-policy' {...field} />
                    </FormControl>
                    <FormDescription>
                      Permanent identifier linking this policy to the rules the
                      system enforces.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>
            <SheetFooter className='shrink-0 gap-2 border-t border-border pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={isPending}>
                Publish
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
