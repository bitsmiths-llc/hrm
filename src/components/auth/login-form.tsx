'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';

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
import { Separator } from '@/components/ui/separator';

import { onError } from '@/lib/show-error-toast';
import { supabase } from '@/lib/supabase/client';

import { paths } from '@/constants/paths';
import { type LoginInput, loginSchema } from '@/schema/auth';

type LoginFormProps = {
  /** Set to `not_invited` when the OAuth gate rejected an un-invited account. */
  errorCode?: string;
};

export function LoginForm({ errorCode }: LoginFormProps) {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (errorCode === 'not_invited') {
      toast.error('That account has no invitation', {
        description:
          'Access is invite-only. Ask your admin to invite your email first.',
      });
    }
  }, [errorCode]);

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

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${paths.auth.callback}` },
    });
    if (error) {
      toast.error('Could not start Google sign-in. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl font-semibold'>Sign in</CardTitle>
        <CardDescription>
          Accounts are created by invitation — there&apos;s no public sign-up.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <Button
          type='button'
          variant='outline'
          onClick={signInWithGoogle}
          isLoading={isGoogleLoading}
          disabled={isPending}
          iconLeft={FcGoogle}
        >
          Continue with Google
        </Button>

        <div className='flex items-center gap-3'>
          <Separator className='flex-1' />
          <span className='text-xs text-muted-foreground'>or</span>
          <Separator className='flex-1' />
        </div>

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
            <Button
              type='submit'
              isLoading={isPending}
              disabled={isGoogleLoading}
            >
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
