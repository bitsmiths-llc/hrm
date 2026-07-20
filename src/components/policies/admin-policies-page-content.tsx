'use client';

import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { currentVersion, usePolicies } from '@/hooks/queries/policies';

import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';
import { HrmSettingsForm } from '@/components/settings/hrm-settings-form';
import { OnboardingTemplateForm } from '@/components/settings/onboarding-template-form';
import { ProjectsSettingsCard } from '@/components/settings/projects-settings-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { policyCategoryLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';

import { CreatePolicyDialog } from './create-policy-dialog';

export function AdminPoliciesPageContent() {
  const { data: policies, isLoading } = usePolicies();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <PageHeader
        title='Policies'
        description='Company policy documents and the numeric rules that govern leave, medical allowance, and payroll.'
      />

      <Tabs defaultValue='documents'>
        <TabsList>
          <TabsTrigger value='documents'>Documents</TabsTrigger>
          <TabsTrigger value='configuration'>Configuration</TabsTrigger>
          <TabsTrigger value='onboarding-email'>Onboarding Email</TabsTrigger>
        </TabsList>

        <TabsContent value='documents' className='flex flex-col gap-4'>
          <div className='flex justify-end'>
            <Button onClick={() => setCreateOpen(true)}>New Policy</Button>
          </div>
          {isLoading ? (
            <Skeleton className='h-64 rounded-xl' />
          ) : !policies?.length ? (
            <EmptyState
              icon={FileText}
              title='No policies yet'
              description='Create the first policy document for employees to view and acknowledge.'
            />
          ) : (
            <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
              {policies.map((policy) => {
                const latest = currentVersion(policy);
                return (
                  <li key={policy.id}>
                    <Link
                      href={`${paths.admin.policies}/${policy.id}`}
                      className='flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-accent hover:text-accent-foreground'
                    >
                      <div className='flex min-w-0 flex-col gap-0.5'>
                        <p className='truncate text-sm font-medium'>
                          {policy.title}
                        </p>
                        <p className='truncate text-xs text-muted-foreground'>
                          Version {latest.version} · Updated{' '}
                          {format(latest.publishedAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant='outline'>
                        {policyCategoryLabels[policy.category]}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value='configuration'>
          <p className='mb-4 text-sm text-muted-foreground'>
            Module-wide values applied whenever leave, medical allowance, or
            payroll is calculated. Changes take effect on the next run.
          </p>
          <div className='grid items-start gap-4 lg:grid-cols-2'>
            <HrmSettingsForm />
            <ProjectsSettingsCard />
          </div>
        </TabsContent>

        <TabsContent value='onboarding-email'>
          <p className='mb-4 text-sm text-muted-foreground'>
            The invitation email sent to every new employee. Edit it once — the
            same template is reused for all invitations.
          </p>
          <OnboardingTemplateForm />
        </TabsContent>
      </Tabs>

      <CreatePolicyDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
