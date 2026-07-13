'use client';

import { ShieldCheck, User } from 'lucide-react';

import { useCurrentEmployee } from '@/hooks/queries/employees';

import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

/** Sidebar identity for the signed-in user. Purely informational — it replaced
 *  the dev-only role switcher, so there is no way to cross into the other
 *  role's app from here (real auth + the middleware role funnel decide that). */
export function UserCard() {
  const { data: employee, isLoading } = useCurrentEmployee();

  const isAdmin = employee?.role === 'admin';
  const Icon = isAdmin ? ShieldCheck : User;
  const name = employee?.full_name?.trim() || employee?.email || '';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className='flex items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:p-0'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Icon className='size-4' aria-hidden />
          </div>
          <div className='grid flex-1 leading-tight group-data-[collapsible=icon]:hidden'>
            {isLoading ? (
              <>
                <Skeleton className='h-3.5 w-24' />
                <Skeleton className='mt-1.5 h-3 w-16' />
              </>
            ) : (
              <>
                <span className='truncate text-sm font-medium'>{name}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {isAdmin ? 'Administrator' : 'Employee'}
                </span>
              </>
            )}
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
