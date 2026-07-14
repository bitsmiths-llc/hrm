'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useLogOvertime } from '@/hooks/actions/use-log-overtime';
import { useProjects } from '@/hooks/queries/projects';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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

import { type OvertimeLogInput, overtimeLogSchema } from '@/schema/overtime';

export function LogOvertimeDialog() {
  const [open, setOpen] = useState(false);
  const { data: projects } = useProjects();
  const projectOptions = (projects ?? []).map((project) => ({
    label: project.name,
    value: project.id,
  }));

  const form = useForm<OvertimeLogInput>({
    resolver: zodResolver(overtimeLogSchema),
    defaultValues: {
      date: '',
      hours: 1,
      projectId: '',
      task: '',
    },
  });

  const { execute, isPending } = useLogOvertime(() => {
    const { hours, projectId } = form.getValues();
    const projectName =
      projects?.find((project) => project.id === projectId)?.name ??
      'the project';
    toast.success(`${hours}h logged for ${projectName} — awaiting approval`);
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
        <Button iconLeft={Plus}>Log overtime</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Log overtime</DialogTitle>
          <DialogDescription>
            Only approved hours are paid out, at the configured overtime rate for
            the pay period they fall in — pay is computed during the payroll run.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => execute(values))}
            className='flex flex-col gap-4'
          >
            <div className='grid grid-cols-2 gap-4'>
              <ControlledDatePicker<OvertimeLogInput>
                name='date'
                label='Date'
                disabledDates={{ after: new Date() }}
              />
              <FormField
                control={form.control}
                name='hours'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input type='number' step={0.5} min={0.5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <ControlledSelect<OvertimeLogInput>
              name='projectId'
              label='Project'
              options={projectOptions}
              placeholder='Select a project'
            />
            <FormField
              control={form.control}
              name='task'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='What did you work on?'
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
                Submit log
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
