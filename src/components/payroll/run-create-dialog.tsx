'use client';

import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCreateRun } from '@/hooks/actions/use-create-run';

import { ScrollableDialogContent } from '@/components/hrm/scrollable-dialog-content';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MonthSelector } from '@/components/ui/month-selector';

import { paths } from '@/constants/paths';

/** Current month as 'YYYY-MM'. */
const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/** Create a run for any month (current, back-dated, or future). `days_in_month`
 *  is derived server-side. On success we navigate to the run's screen; a
 *  duplicate resolves to the existing run, so this is safe to click twice. */
export function RunCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(currentMonth);

  const { execute, isPending } = useCreateRun((run) => {
    setOpen(false);
    const target = run ? run.period_month.slice(0, 7) : month;
    router.push(`${paths.admin.payroll}/${target}`);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button iconLeft={PlusCircle}>Create run</Button>
      </DialogTrigger>
      <ScrollableDialogContent>
        <DialogHeader>
          <DialogTitle>Create a payroll run</DialogTitle>
          <DialogDescription>
            Pick the month to run payroll for. The number of days in the month is
            derived automatically.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <Label>Month</Label>
          <MonthSelector value={month} onChange={setMonth} />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            onClick={() => execute({ period_month: `${month}-01` })}
          >
            Create run
          </Button>
        </DialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}
