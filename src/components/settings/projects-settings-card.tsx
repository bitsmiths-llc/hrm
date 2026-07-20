'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { FolderKanban, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useProjects } from '@/hooks/queries/projects';

import { Button } from '@/components/ui/button';
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

import { SettingsCard } from './settings-card';

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
      name: values.name.trim(),
    };
    queryClient.setQueryData<Project[]>([QueryKeys.PROJECTS], (old) => [
      ...(old ?? []),
      newProject,
    ]);
    toast.success(`${newProject.name} added`);
    form.reset();
  };

  const handleRemove = (project: Project) => {
    queryClient.setQueryData<Project[]>([QueryKeys.PROJECTS], (old) =>
      (old ?? []).filter((p) => p.id !== project.id),
    );
    toast.success(`${project.name} removed`);
  };

  if (isLoading || !projects) {
    return <Skeleton className='h-64 rounded-xl' />;
  }

  return (
    <SettingsCard
      icon={FolderKanban}
      title='Projects'
      description='The list employees choose from when logging overtime.'
    >
      <div className='flex flex-1 flex-col gap-4 py-4'>
        {projects.length > 0 ? (
          <ul className='flex flex-wrap gap-2'>
            {projects.map((project) => (
              <li
                key={project.id}
                className='flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-3 pr-1.5 text-sm'
              >
                {project.name}
                <button
                  type='button'
                  onClick={() => handleRemove(project)}
                  className='flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                  aria-label={`Remove ${project.name}`}
                >
                  <X className='size-3.5' />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-sm text-muted-foreground'>
            No projects yet — add the first one below.
          </p>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='mt-auto flex items-start gap-2'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <Input placeholder='New project name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              iconLeft={Plus}
              isLoading={form.formState.isSubmitting}
            >
              Add
            </Button>
          </form>
        </Form>
      </div>
    </SettingsCard>
  );
}
