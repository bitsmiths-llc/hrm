'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { PageHeader } from '@/components/hrm/page-header';
import { Button } from '@/components/ui/button';

import { paths } from '@/constants/paths';

import { PolicyComplianceTable } from './policy-compliance-table';

export function PolicyCompliancePageContent() {
  return (
    <>
      <div>
        <Link href={paths.admin.policies}>
          <Button variant='ghost' size='sm' iconLeft={ArrowLeft}>
            Back to Policies
          </Button>
        </Link>
      </div>

      <PageHeader
        title='Policy compliance'
        description='Who has acknowledged the current version of each policy. Publishing an update resets a policy here until everyone re-acknowledges.'
      />

      <PolicyComplianceTable />
    </>
  );
}
