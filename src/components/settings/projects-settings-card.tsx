'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLink, FolderKanban, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useCreateProject,
  useDeleteProject,
  useToggleProjectActive,
} from '@/hooks/actions/use-manage-projects';
import { useProjects } from '@/hooks/queries/projects';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { SettingsCard } from './settings-card';

import { Project } from '@/types/hrm';
import { type CreateProjectInput, createProjectSchema } from '@/schema/project';

/** Employees pick from this list when logging overtime (see
 *  log-overtime-dialog.tsx). Admins add or remove entries here; "remove" is a
 *  soft delete, so existing logs that reference a project still resolve it. */
export function ProjectsSettingsCard() {
  const { data: projects, isLoading } = useProjects();

  const { execute: deleteProject } = useDeleteProject(() =>
    toast.success('Project deleted'),
  );

  const { execute: toggleProject } = useToggleProjectActive();

  const handleToggle = (project: Project) => {
    toggleProject({ projectId: project.id, active: !project.active });
  };

  if (isLoading || !projects) {
    return <Skeleton className='h-64 w-full rounded-xl' />;
  }

  const activeProjects = projects.filter((project) => project.active);
  const inactiveProjects = projects.filter((project) => !project.active);

  return (
    <SettingsCard
      icon={FolderKanban}
      title='Projects'
      description='Company projects — active ones are visible to employees.'
      action={<AddProjectDialog />}
    >
      <div className='flex flex-1 flex-col gap-4 py-4'>
        {activeProjects.length > 0 ? (
          <ul className='flex flex-col gap-2'>
            {activeProjects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onToggle={handleToggle}
                onRemove={(p) => deleteProject({ projectId: p.id })}
              />
            ))}
          </ul>
        ) : (
          <p className='text-sm text-muted-foreground'>
            No active projects — add one with the button above.
          </p>
        )}

        {inactiveProjects.length > 0 && (
          <Accordion type='single' collapsible>
            <AccordionItem value='inactive' className='border-none'>
              <AccordionTrigger className='py-2 text-xs font-medium text-muted-foreground hover:no-underline'>
                Inactive ({inactiveProjects.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className='flex flex-col gap-2'>
                  {inactiveProjects.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      onToggle={handleToggle}
                      onRemove={(p) => deleteProject({ projectId: p.id })}
                    />
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </SettingsCard>
  );
}

function ProjectRow({
  project,
  onToggle,
  onRemove,
}: {
  project: Project;
  onToggle: (project: Project) => void;
  onRemove: (project: Project) => void;
}) {
  return (
    <li
      className={`flex items-start justify-between gap-3 rounded-lg border border-border p-3 ${
        project.active ? '' : 'opacity-70'
      }`}
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
      <div className='flex shrink-0 items-center gap-1'>
        <Switch
          checked={project.active}
          onCheckedChange={() => onToggle(project)}
          aria-label={`Mark ${project.name} ${
            project.active ? 'inactive' : 'active'
          }`}
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type='button'
              className='flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 className='size-3.5' />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {project.name}? This can’t be
                undone, and employees will no longer be able to log overtime
                against it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onRemove(project)}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

/** "New project" button that opens a side sheet capturing all fields. */
function AddProjectDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', description: '', techStack: '', url: '' },
  });

  const { execute: createProject, isPending } = useCreateProject(() => {
    toast.success('Project added');
    setOpen(false);
  });

  const onSubmit = (values: CreateProjectInput) => {
    createProject(values);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <SheetTrigger asChild>
        <Button size='sm' iconLeft={Plus}>
          New project
        </Button>
      </SheetTrigger>
      <SheetContent className='flex w-full flex-col gap-6 overflow-y-auto sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>New project</SheetTitle>
          <SheetDescription>
            Employees pick active projects when logging overtime.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-1 flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. HRM Frontend' {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='What the project is about'
                      {...field}
                    />
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
                  <FormLabel>Tech stack (comma separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Next.js, TypeScript, Supabase'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='https://github.com/…' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className='mt-auto'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={isPending}>
                Add project
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
