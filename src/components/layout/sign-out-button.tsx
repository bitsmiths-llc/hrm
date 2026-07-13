'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';

import { signOut } from '@/actions/auth';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { onError } from '@/lib/show-error-toast';

import { paths } from '@/constants/paths';

export function SignOutButton() {
  const router = useRouter();

  const { execute, isPending } = useAction(signOut, {
    onSuccess: () => {
      router.push(paths.auth.login);
      router.refresh();
    },
    onError,
  });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip='Sign out'
          disabled={isPending}
          onClick={() => execute()}
        >
          <LogOut aria-hidden />
          <span>Sign out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
