'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useOnboardingEmailTemplate } from '@/hooks/queries/onboarding-email';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { ONBOARDING_EMAIL_PLACEHOLDERS } from '@/constants/mock/onboarding-email';
import { QueryKeys } from '@/constants/query-keys';

import { OnboardingEmailTemplate } from '@/types/hrm';

const templateSchema = z.object({
  subject: z.string().min(3, 'Enter a subject line'),
  bodyHtml: z.string().min(20, 'Write the email body'),
});
type TemplateInput = z.infer<typeof templateSchema>;

/** The single invitation email, edited here and reused for every invite
 *  (PRD 6.4). Placeholders are copied in and swapped per recipient at send
 *  time. Saving mutates the template cache. */
export function OnboardingTemplateForm() {
  const queryClient = useQueryClient();
  const { data: template, isLoading } = useOnboardingEmailTemplate();

  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    values: template ?? undefined,
  });

  const onSubmit = (values: TemplateInput) => {
    queryClient.setQueryData<OnboardingEmailTemplate>(
      [QueryKeys.ONBOARDING_EMAIL_TEMPLATE],
      values,
    );
    form.reset(values);
    toast.success('Onboarding email template saved');
  };

  const copyPlaceholder = async (token: string) => {
    await navigator.clipboard.writeText(token);
    toast.success(`Copied ${token}`);
  };

  if (isLoading || !template) {
    return <Skeleton className='h-96 rounded-xl' />;
  }

  return (
    <Card className='max-w-3xl'>
      <CardContent className='p-6'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-5'
          >
            <FormField
              control={form.control}
              name='subject'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-col gap-2'>
              <span className='text-sm font-medium'>Placeholders</span>
              <div className='flex flex-wrap gap-2'>
                {ONBOARDING_EMAIL_PLACEHOLDERS.map((placeholder) => (
                  <button
                    key={placeholder.token}
                    type='button'
                    onClick={() => copyPlaceholder(placeholder.token)}
                    className='flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-3 pr-2.5 text-xs hover:bg-accent hover:text-accent-foreground'
                  >
                    <code className='font-mono'>{placeholder.token}</code>
                    <Copy className='size-3 text-muted-foreground' />
                  </button>
                ))}
              </div>
              <p className='text-xs text-muted-foreground'>
                Click to copy, then paste into the subject or body. Each is
                replaced with the recipient’s details when the invite is sent.
              </p>
            </div>

            <ControlledRichText<TemplateInput>
              name='bodyHtml'
              label='Email body'
            />
            <FormDescription>
              Sent automatically whenever you invite an employee. This one
              template is reused for every invitation.
            </FormDescription>

            <div className='flex justify-end'>
              <Button
                type='submit'
                disabled={!form.formState.isDirty}
                isLoading={form.formState.isSubmitting}
              >
                Save template
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
