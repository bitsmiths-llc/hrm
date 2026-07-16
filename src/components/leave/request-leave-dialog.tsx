'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCreateLeaveRequest } from '@/hooks/actions/use-create-leave-request';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ControlledDatePicker } from '@/components/ui/form/controlled-date-picker';
import { ControlledSelect } from '@/components/ui/form/controlled-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { hrmConfig } from '@/constants/hrm-config';
import { leaveTypeLabels } from '@/constants/hrm-labels';
import {
  createLeaveRequestSchema,
  type LeaveRequestInput,
} from '@/schema/leave';

const leaveTypeOptions = Object.entries(leaveTypeLabels).map(
  ([value, label]) => ({ value, label }),
);

export function RequestLeaveDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<LeaveRequestInput>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      type: undefined,
      startDate: '',
      days: 1,
      reason: '',
    },
  });

  const type = form.watch('type');
  const isHalfDay = type === 'half_day';

  useEffect(() => {
    if (isHalfDay) form.setValue('days', hrmConfig.halfDayValue);
  }, [isHalfDay, form]);

  const { execute, isPending } = useCreateLeaveRequest(() => {
    toast.success(`${leaveTypeLabels[type]} request submitted for approval`);
    form.reset();
    setOpen(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button iconLeft={Plus}>Request leave</Button>
      </DialogTrigger>
      <ScrollableDialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Request leave</DialogTitle>
          <DialogDescription>
            Paid, sick, and half-day leave draw from your shared pool. Unpaid
            leave is reviewed separately and reduces pay.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => execute(values))}
            className='flex flex-col gap-4'
          >
            <ControlledSelect<LeaveRequestInput>
              name='type'
              label='Leave type'
              options={leaveTypeOptions}
              placeholder='Select leave type'
            />
            <div className='grid grid-cols-2 gap-4'>
              <ControlledDatePicker<LeaveRequestInput>
                name='startDate'
                label='First day'
              />
              <FormField
                control={form.control}
                name='days'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of days</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step={0.5}
                        min={0.5}
                        disabled={isHalfDay}
                        {...field}
                        value={isHalfDay ? hrmConfig.halfDayValue : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed reason</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='Why do you need this leave?'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={isPending}>
                Submit request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  );
}
