import { Metadata } from 'next';

import { PageHeader } from '@/components/hrm/page-header';
import { MedicalPageContent } from '@/components/medical/medical-page-content';
import { SubmitClaimDialog } from '@/components/medical/submit-claim-dialog';

import { getMedicalIneligibilityReason } from '@/lib/medical-eligibility';

import { mockCurrentEmployee } from '@/constants/mock/employees';

export const metadata: Metadata = { title: 'Medical' };

export default function MedicalPage() {
  const ineligibilityReason =
    getMedicalIneligibilityReason(mockCurrentEmployee);

  return (
    <>
      <PageHeader
        title='Medical Allowance'
        description='Submit claims against your accrued allowance and track your balance.'
      >
        <SubmitClaimDialog disabled={!!ineligibilityReason} />
      </PageHeader>
      {!!ineligibilityReason && (
        <div className='rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
          {ineligibilityReason}
        </div>
      )}
      <MedicalPageContent />
    </>
  );
}
