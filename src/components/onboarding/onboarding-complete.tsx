'use client';

import {
  ArrowRight,
  ExternalLink,
  FolderKanban,
  PartyPopper,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { useEmployees } from '@/hooks/queries/employees';
import { useProjects } from '@/hooks/queries/projects';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { getInitials } from '@/lib/team';

import { paths } from '@/constants/paths';

/** Shown once onboarding is submitted — welcomes the new hire with a quick
 *  intro to their teammates and the projects in flight, then points them to
 *  the dashboard and full team directory. */
export function OnboardingComplete({ firstName }: { firstName?: string }) {
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const teammates = (employees ?? [])
    .filter((employee) => employee.status !== 'invited')
    .slice(0, 6);
  const activeProjects = (projects ?? []).filter((project) => project.active);

  return (
    <Card className='max-w-3xl'>
      <CardContent className='flex flex-col gap-8 p-8'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className='flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <PartyPopper className='size-7' aria-hidden />
          </div>
          <div className='flex flex-col gap-1'>
            <h2 className='text-xl font-bold tracking-tight'>
              {firstName ? `You’re all set, ${firstName}!` : 'You’re all set!'}
            </h2>
            <p className='max-w-md text-sm text-muted-foreground'>
              Your account is active. Here’s a quick look at the team you’re
              joining and what we’re building together.
            </p>
          </div>
        </div>

        <section className='flex flex-col gap-3'>
          <div className='flex items-center gap-2 text-sm font-semibold'>
            <Users className='size-4 text-muted-foreground' aria-hidden />
            Meet the team
          </div>
          {employeesLoading ? (
            <div className='grid gap-2 sm:grid-cols-2'>
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className='h-14 rounded-lg' />
              ))}
            </div>
          ) : (
            <div className='grid gap-2 sm:grid-cols-2'>
              {teammates.map((member) => (
                <div
                  key={member.id}
                  className='flex items-center gap-3 rounded-lg border border-border p-3'
                >
                  <Avatar className='size-9'>
                    <AvatarFallback className='text-xs font-medium'>
                      {getInitials(member.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex min-w-0 flex-col'>
                    <span className='truncate text-sm font-medium'>
                      {member.fullName}
                    </span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {member.designation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className='flex flex-col gap-3'>
          <div className='flex items-center gap-2 text-sm font-semibold'>
            <FolderKanban
              className='size-4 text-muted-foreground'
              aria-hidden
            />
            What we’re working on
          </div>
          {projectsLoading ? (
            <div className='grid gap-2 sm:grid-cols-2'>
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className='h-14 rounded-lg' />
              ))}
            </div>
          ) : (
            <div className='grid gap-2 sm:grid-cols-2'>
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className='flex flex-col gap-2 rounded-lg border border-border p-3'
                >
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-sm font-medium'>{project.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      {project.description}
                    </span>
                  </div>
                  {project.techStack.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {project.techStack.map((tech: string) => (
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
              ))}
            </div>
          )}
        </section>

        <div className='flex flex-col gap-2 sm:flex-row sm:justify-center'>
          <Link href={paths.employee.dashboard}>
            <Button icon={ArrowRight} className='w-full sm:w-auto'>
              Go to dashboard
            </Button>
          </Link>
          <Link href={paths.employee.company}>
            <Button variant='outline' className='w-full sm:w-auto'>
              Explore the company
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
