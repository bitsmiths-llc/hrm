'use client';

import { ExternalLink, FolderKanban } from 'lucide-react';

import { useProjects } from '@/hooks/queries/projects';

import { EmptyState } from '@/components/hrm/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Read-only view of the company's active projects, for the employee-facing
 *  Company page. Admins manage the list under Policies → Configuration. */
export function CompanyProjects() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-36 rounded-xl' />
        ))}
      </div>
    );
  }

  const activeProjects = (projects ?? []).filter((project) => project.active);

  if (!activeProjects.length) {
    return (
      <EmptyState
        icon={FolderKanban}
        title='No active projects'
        description='Projects appear here once they’re added and marked active.'
      />
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
      {activeProjects.map((project) => (
        <Card key={project.id}>
          <CardContent className='flex flex-col gap-3 p-5'>
            <div className='flex flex-col gap-0.5'>
              <span className='font-medium'>{project.name}</span>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
