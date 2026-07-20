import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { HrmSettingsForm } from '@/components/settings/hrm-settings-form';
import { ModuleTogglesTab } from '@/components/settings/module-toggles-tab';
import { OnboardingEmailPlaceholder } from '@/components/settings/onboarding-email-placeholder';
import { PolicyManagementLink } from '@/components/settings/policy-management-link';
import { ProjectsSettingsCard } from '@/components/settings/projects-settings-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = { title: 'Settings' };

/** Settings hub (BIT-20). A Tabs shell that AGGREGATES existing editors rather
 *  than rebuilding them: Payroll Settings imports the M2 `payroll_settings`
 *  editor, Onboarding Email is the M3.4 CKEditor slot, and Policy Management
 *  links into the M3 Policies workspace. Only Module Toggles is new here. */
export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title='Settings'
        description='System configuration and module toggles.'
      />

      <Tabs defaultValue='payroll'>
        <TabsList>
          <TabsTrigger value='payroll'>Payroll Settings</TabsTrigger>
          <TabsTrigger value='toggles'>Module Toggles</TabsTrigger>
          <TabsTrigger value='email'>Onboarding Email</TabsTrigger>
          <TabsTrigger value='policies'>Policy Management</TabsTrigger>
        </TabsList>

        <TabsContent value='payroll'>
          <div className='grid items-start gap-4 lg:grid-cols-2'>
            <HrmSettingsForm />
            <ProjectsSettingsCard />
          </div>
        </TabsContent>

        <TabsContent value='toggles'>
          <ModuleTogglesTab />
        </TabsContent>

        <TabsContent value='email'>
          <OnboardingEmailPlaceholder />
        </TabsContent>

        <TabsContent value='policies'>
          <PolicyManagementLink />
        </TabsContent>
      </Tabs>
    </>
  );
}
