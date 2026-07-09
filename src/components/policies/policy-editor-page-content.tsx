'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileX2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  currentVersion,
  useActiveEmployees,
  useAllPolicyAcknowledgments,
  usePolicy,
} from '@/hooks/queries/policies';

import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';
import { RichTextEditor } from '@/components/hrm/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { policyCategoryLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

import { PolicyComplianceList } from './policy-compliance-list';
import { PolicyVersionHistory } from './policy-version-history';
import { PublishPolicyVersionDialog } from './publish-policy-version-dialog';

import { Policy } from '@/types/hrm';

type PolicyEditorPageContentProps = {
  policyId: string;
};

export function PolicyEditorPageContent({
  policyId,
}: PolicyEditorPageContentProps) {
  const queryClient = useQueryClient();
  const { data: policy, isLoading } = usePolicy(policyId);
  const { data: employees } = useActiveEmployees();
  const { data: acknowledgments } = useAllPolicyAcknowledgments();

  const [draftHtml, setDraftHtml] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  if (isLoading) return <Skeleton className='h-96 rounded-xl' />;

  if (!policy) {
    return (
      <EmptyState
        icon={FileX2}
        title='Policy not found'
        description='This policy may have been removed.'
      />
    );
  }

  const latest = currentVersion(policy);
  const content = draftHtml ?? latest.contentHtml;
  const isDirty = draftHtml !== null && draftHtml !== latest.contentHtml;

  const handlePublish = (changeSummary: string) => {
    const publishedAt = new Date().toISOString().slice(0, 10);
    queryClient.setQueryData<Policy[]>([QueryKeys.POLICIES], (old) =>
      old?.map((p) =>
        p.id === policy.id
          ? {
              ...p,
              versions: [
                ...p.versions,
                {
                  version: latest.version + 1,
                  contentHtml: content,
                  changeSummary,
                  publishedAt,
                },
              ],
            }
          : p,
      ),
    );
    setDraftHtml(null);
    toast.success(`${policy.title} updated to version ${latest.version + 1}`);
  };

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
        title={policy.title}
        description={`${policyCategoryLabels[policy.category]} · Version ${latest.version}`}
      >
        <Button disabled={!isDirty} onClick={() => setPublishOpen(true)}>
          Publish update
        </Button>
      </PageHeader>

      <RichTextEditor value={content} onChange={setDraftHtml} />

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-3'>
          <h2 className='text-lg font-semibold'>Version history</h2>
          <PolicyVersionHistory versions={policy.versions} />
        </div>
        <div className='flex flex-col gap-3'>
          <h2 className='text-lg font-semibold'>Acknowledgment status</h2>
          <PolicyComplianceList
            policy={policy}
            employees={employees ?? []}
            acknowledgments={(acknowledgments ?? []).filter(
              (ack) => ack.policyId === policy.id,
            )}
          />
        </div>
      </div>

      <PublishPolicyVersionDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onConfirm={handlePublish}
      />
    </>
  );
}
