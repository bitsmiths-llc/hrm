'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FolderKanban, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useProjects } from '@/hooks/queries/projects';

import { Badge } from '@/components/ui/badge';
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
  description: z.string().min(4, 'Enter a short description'),
  techStack: z.string().min(1, 'Enter at least one technology'),
  url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});
type AddProjectInput = z.infer<typeof addProjectSchema>;

/** Employees pick from this list when logging overtime (see
 *  log-overtime-dialog.tsx) instead of typing a free-text project name. */
export function ProjectsSettingsCard() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useProjects();

  const form = useForm<AddProjectInput>({
    resolver: zodResolver(addProjectSchema),
    defaultValues: { name: '', description: '', techStack: '', url: '' },
  });

  const onSubmit = (values: AddProjectInput) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: values.name.trim(),
      description: values.description.trim(),
      techStack: values.techStack
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean),
      url: values.url?.trim() ?? '',
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
          <ul className='flex flex-col gap-2'>
            {projects.map((project) => (
              <li
                key={project.id}
                className='flex items-start justify-between gap-3 rounded-lg border border-border p-3'
              >
                <div className='flex min-w-0 flex-col gap-1.5'>
                  <div className='flex min-w-0 flex-col'>
                    <span className='text-sm font-medium'>{project.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      {project.description}
                    </span>
                  </div>
                  {project.techStack.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {project.techStack.map((tech) => (
                        <Badge key={tech} variant='secondary'>
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {!!project.url && (
                    <a
                      href={project.url}
                      target='_blank'
                      rel='noreferrer'
                      className='flex w-fit items-center gap-1 text-xs text-primary hover:underline'
                    >
                      <ExternalLink className='size-3' />
                      <span className='truncate'>
                        {project.url.replace(/^https?:\/\//, '')}
                      </span>
                    </a>
                  )}
                </div>
                <button
                  type='button'
                  onClick={() => handleRemove(project)}
                  className='flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
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
            className='mt-auto flex flex-col gap-2'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='New project name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='Short description' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='techStack'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder='Tech stack (comma-separated)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex items-start gap-2'>
              <FormField
                control={form.control}
                name='url'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormControl>
                      <Input placeholder='Project URL (optional)' {...field} />
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
            </div>
          </form>
        </Form>
      </div>
    </SettingsCard>
  );
}
