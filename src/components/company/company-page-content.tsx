'use client';

import { CompanyProjects } from '@/components/company/company-projects';
import { TeamDirectory } from '@/components/team/team-directory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CompanyPageContent() {
  return (
    <Tabs defaultValue='team'>
      <TabsList>
        <TabsTrigger value='team'>Team</TabsTrigger>
        <TabsTrigger value='projects'>Projects</TabsTrigger>
      </TabsList>

      <TabsContent value='team'>
        <TeamDirectory />
      </TabsContent>

      <TabsContent value='projects'>
        <CompanyProjects />
      </TabsContent>
    </Tabs>
  );
}
