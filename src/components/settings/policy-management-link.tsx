import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { paths } from '@/constants/paths';

/** Policy Management tab. M4 does not rebuild the policy editor — company policy
 *  documents, versions, and the numeric rules live in the M3 Policies workspace
 *  (M3.1). This tab just links across. */
export function PolicyManagementLink() {
  return (
    <Card className='flex max-w-2xl flex-col gap-4 p-6'>
      <div className='flex items-start gap-3'>
        <div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'>
          <FileText className='size-4' aria-hidden />
        </div>
        <div className='flex flex-col gap-0.5'>
          <h3 className='text-sm font-semibold'>Policy Management</h3>
          <p className='text-sm text-muted-foreground'>
            Company policy documents, versions, and the numeric rules that govern
            leave, medical allowance, and payroll are managed in the Policies
            workspace.
          </p>
        </div>
      </div>
      <Button asChild className='self-start'>
        <Link href={paths.admin.policies}>
          Open Policy Management
          <ArrowRight />
        </Link>
      </Button>
    </Card>
  );
}
