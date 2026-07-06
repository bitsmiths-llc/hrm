'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form, FormItem, FormLabel } from '@/components/ui/form';
import { ControlledPasswordInput } from '@/components/ui/form/controlled-password-input';
import { Input } from '@/components/ui/input';

import { paths } from '@/constants/paths';
import {
  type AcceptInvitationInput,
  acceptInvitationSchema,
} from '@/schema/auth';

type AcceptInvitationFormProps = {
  /** Comes from the invitation link; read-only here. Mocked for now. */
  email: string;
};

/** Landing screen for the emailed invitation link (PRD 4.2.2): the employee
 *  sets a password, then is routed straight into onboarding. */
export function AcceptInvitationForm({ email }: AcceptInvitationFormProps) {
  const router = useRouter();

  const form = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (_values: AcceptInvitationInput) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success('Account created — let’s complete your onboarding');
    router.push(paths.employee.onboarding);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>
          Welcome to Bitsmiths
        </CardTitle>
        <CardDescription>
          Set a password to activate your account, then complete onboarding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input value={email} disabled readOnly />
            </FormItem>
            <ControlledPasswordInput<AcceptInvitationInput>
              name='password'
              label='Password'
              placeholder='••••••••'
            />
            <ControlledPasswordInput<AcceptInvitationInput>
              name='confirmPassword'
              label='Confirm password'
              placeholder='••••••••'
              hideInstructions
            />
            <Button type='submit' isLoading={form.formState.isSubmitting}>
              Create account & start onboarding
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
