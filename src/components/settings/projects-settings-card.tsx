'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useProjects } from '@/hooks/queries/projects';

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

import { QueryKeys } from '@/constants/query-keys';

import { Project } from '@/types/hrm';

const addProjectSchema = z.object({
  name: z.string().min(2, 'Enter a project name'),
});
type AddProjectInput = z.infer<typeof addProjectSchema>;

/** Employees pick from this list when logging overtime (see
 *  log-overtime-dialog.tsx) instead of typing a free-text project name. */
export function ProjectsSettingsCard() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useProjects();

  const form = useForm<AddProjectInput>({
    resolver: zodResolver(addProjectSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = (values: AddProjectInput) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: values.name,
    };
    queryClient.setQueryData<Project[]>([QueryKeys.PROJECTS], (old) => [
      ...(old ?? []),
      newProject,
    ]);
    toast.success(`${values.name} added to the project list`);
    form.reset();
  };

  if (isLoading || !projects) {
    return <Skeleton className='h-64 w-full max-w-md rounded-xl' />;
  }

  return (
    <Card className='max-w-md'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-medium'>Overtime Projects</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ul className='flex flex-col gap-1.5'>
          {projects.map((project) => (
            <li
              key={project.id}
              className='rounded-md border border-border px-3 py-1.5 text-sm'
            >
              {project.name}
            </li>
          ))}
        </ul>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
              isLoading={form.formState.isSubmitting}
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
