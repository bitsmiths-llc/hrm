'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUpdateOnboardingEmailTemplate } from '@/hooks/actions/use-update-onboarding-email-template';
import { useOnboardingEmailTemplate } from '@/hooks/queries/email-template';

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

import { appConfig } from '@/config/app';
import {
  fillOnboardingPreview,
  ONBOARDING_EMAIL_TOKENS,
} from '@/constants/onboarding-email';
import {
  type EmailTemplateInput,
  emailTemplateSchema,
} from '@/schema/email-template';

import { OnboardingEmailTemplate } from '@/types/hrm';

/** The single invitation email, edited here and reused for every invite
 *  (PRD §6.4). Backed by the `onboarding_email_template` singleton: the body is
 *  sanitized server-side on save, and the invite flow renders the tokens per
 *  recipient. The preview on the right shows them filled with sample values. */
export function OnboardingTemplateForm() {
  const { data: template, isLoading } = useOnboardingEmailTemplate();

  if (isLoading || !template) {
    return <Skeleton className='h-96 rounded-xl' />;
  }

  // Mount the fields only once the template exists so every input is controlled
  // from its first render (see HrmSettingsForm — otherwise the values arrive a
  // commit later and React warns about uncontrolled→controlled inputs).
  return <OnboardingTemplateFields template={template} />;
}

function OnboardingTemplateFields({
  template,
}: {
  template: OnboardingEmailTemplate;
}) {
  const form = useForm<EmailTemplateInput>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: template,
    values: template,
  });

  // On success the action invalidates the template query, so `values: template`
  // re-syncs the form and clears the dirty state.
  const { execute, isPending } = useUpdateOnboardingEmailTemplate(() =>
    toast.success('Onboarding email template saved'),
  );

  // Live values drive the preview as the admin edits.
  const subject = form.watch('subject') ?? '';
  const bodyHtml = form.watch('bodyHtml') ?? '';

  const copyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    toast.success(`Copied ${token}`);
  };

  return (
    <div className='grid items-start gap-4 lg:grid-cols-2'>
      <Card>
        <CardContent className='p-6'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => execute(values))}
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
                  {ONBOARDING_EMAIL_TOKENS.map((placeholder) => (
                    <button
                      key={placeholder.token}
                      type='button'
                      onClick={() => copyToken(placeholder.token)}
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
                  The body must include <code>{'{{onboarding_link}}'}</code>.
                </p>
              </div>

              <ControlledRichText<EmailTemplateInput>
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
                  isLoading={isPending}
                >
                  Save template
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className='flex flex-col gap-2 lg:sticky lg:top-4'>
        <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Preview
        </span>
        <Card className='overflow-hidden'>
          <div className='flex flex-col gap-1 border-b border-border bg-muted/40 px-5 py-3 text-xs'>
            <span className='text-muted-foreground'>
              From{' '}
              <span className='text-foreground'>
                {appConfig.title} &lt;hr@bitsmiths.studio&gt;
              </span>
            </span>
            <span className='text-muted-foreground'>
              To <span className='text-foreground'>Ayesha Khan</span>
            </span>
            <span className='mt-1 text-sm font-semibold text-foreground'>
              {fillOnboardingPreview(subject) || 'No subject'}
            </span>
          </div>
          <div
            className='email-preview px-5 py-4 text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5'
            dangerouslySetInnerHTML={{
              __html:
                fillOnboardingPreview(bodyHtml) ||
                '<p class="text-muted-foreground">Nothing to preview yet.</p>',
            }}
          />
        </Card>
      </div>
    </div>
  );
}
