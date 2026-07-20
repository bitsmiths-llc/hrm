import { ModeToggle } from '@/components/common/mode-toggle';
import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function EmployeeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar role='employee' />
      <SidebarInset>
        <header className='flex h-14 shrink-0 items-center gap-2 border-b border-border px-4'>
          <SidebarTrigger />
          <div className='ml-auto'>
            <ModeToggle />
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-6 p-4 md:p-6'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
