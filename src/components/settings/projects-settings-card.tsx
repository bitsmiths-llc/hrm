'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useCreateProject,
  useDeactivateProject,
} from '@/hooks/actions/use-manage-projects';
import { useProjects } from '@/hooks/queries/projects';

import { ConfirmDialog } from '@/components/hrm/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { type CreateProjectInput, createProjectSchema } from '@/schema/project';

/** Employees pick from this list when logging overtime (see
 *  log-overtime-dialog.tsx). Admins add or remove entries here; "remove" is a
 *  soft delete, so existing logs that reference a project still resolve it. */
export function ProjectsSettingsCard() {
  const { data: projects, isLoading } = useProjects();

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '' },
  });

  const { execute: createProject, isPending: isCreating } = useCreateProject(
    () => {
      toast.success('Project added to the overtime list');
      form.reset();
    },
  );

  // executeAsync so the ConfirmDialog can await it and keep its confirm button
  // in the loading state until the removal settles.
  const { executeAsync: deactivateProject } = useDeactivateProject(() =>
    toast.success('Project removed from the overtime list'),
  );

  if (isLoading || !projects) {
    return <Skeleton className='h-64 w-full rounded-xl' />;
  }

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-medium'>Overtime Projects</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {projects.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No projects yet. Add one below so employees can pick it when logging
            overtime.
          </p>
        ) : (
          <ul className='flex flex-col gap-1.5'>
            {projects.map((project) => (
              <li
                key={project.id}
                className='flex items-center justify-between gap-2 rounded-md border border-border py-1.5 pl-3 pr-1.5 text-sm'
              >
                <span className='truncate'>{project.name}</span>
                <ConfirmDialog
                  trigger={
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-7 shrink-0 text-muted-foreground hover:text-destructive'
                      aria-label={`Remove ${project.name}`}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  }
                  title={`Remove ${project.name}?`}
                  description="It won't appear in the overtime dropdown anymore. Existing logs that reference it are unaffected."
                  confirmLabel='Remove'
                  destructive
                  onConfirm={() => deactivateProject({ projectId: project.id })}
                />
              </li>
            ))}
          </ul>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => createProject(values))}
            className='flex items-start gap-2'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <Input placeholder='e.g. Internal Tooling' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              size='icon'
              isLoading={isCreating}
              aria-label='Add project'
            >
              <Plus className='size-4' />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
