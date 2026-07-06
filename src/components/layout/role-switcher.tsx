'use client';

import { ChevronsUpDown, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { paths } from '@/constants/paths';

type RoleSwitcherProps = {
  currentRole: 'Employee' | 'Admin';
};

/** Dev-only role switcher for the frontend-only phase — swaps between the
 *  employee and admin apps until real auth decides the role. */
export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const Icon = currentRole === 'Admin' ? ShieldCheck : User;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size='lg'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                <Icon className='size-4' aria-hidden />
              </div>
              <div className='grid flex-1 text-left leading-tight'>
                <span className='text-sm font-medium'>{currentRole} view</span>
                <span className='text-xs text-muted-foreground'>
                  Switch role
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' aria-hidden />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='start'
            side='top'
            className='w-[--radix-dropdown-menu-trigger-width]'
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Preview as
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={paths.employee.dashboard}>
                <User className='mr-2 size-4' aria-hidden />
                Employee
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={paths.admin.dashboard}>
                <ShieldCheck className='mr-2 size-4' aria-hidden />
                Admin
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
