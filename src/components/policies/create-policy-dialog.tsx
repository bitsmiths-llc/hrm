'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { usePolicies } from '@/hooks/queries/policies';

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
import { ControlledRichText } from '@/components/ui/form/controlled-rich-text';
import { ControlledSelect } from '@/components/ui/form/controlled-select';
import { Input } from '@/components/ui/input';

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

  const form = useForm<CreatePolicyInput>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: { title: '', category: 'general', contentHtml: '' },
  });

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
          changeSummary: null,
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
    router.push(`${paths.admin.policies}/${id}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset();
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>New policy</DialogTitle>
          <DialogDescription>
            Employees will be able to view this as soon as it's published.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
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
            <ControlledRichText<CreatePolicyInput>
              name='contentHtml'
              label='Content'
            />
            <DialogFooter>
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
