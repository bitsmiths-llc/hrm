'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';

import { signInWithPassword } from '@/actions/auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ControlledPasswordInput } from '@/components/ui/form/controlled-password-input';
import { Input } from '@/components/ui/input';

import { onError } from '@/lib/show-error-toast';

import { paths } from '@/constants/paths';
import { type LoginInput, loginSchema } from '@/schema/auth';

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { execute, isPending } = useAction(signInWithPassword, {
    onSuccess: () => {
      router.push(paths.employee.dashboard);
      router.refresh();
    },
    onError,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>Sign in</CardTitle>
        <CardDescription>
          Accounts are created by invitation — there&apos;s no public sign-up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(execute)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='you@bitsmiths.studio'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ControlledPasswordInput<LoginInput>
              name='password'
              label='Password'
              placeholder='••••••••'
              hideInstructions
            />
            <Button type='submit' isLoading={isPending}>
              Sign in
            </Button>
            <Link
              href={paths.auth.forgotPassword}
              className='text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'
            >
              Forgot your password?
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
