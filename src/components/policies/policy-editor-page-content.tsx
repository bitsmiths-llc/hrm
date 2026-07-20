'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileX2, Send, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  currentVersion,
  useActiveEmployees,
  useAllPolicyAcknowledgments,
  usePolicy,
} from '@/hooks/queries/policies';

import { ConfirmDialog } from '@/components/hrm/confirm-dialog';
import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';
import { RichTextEditor } from '@/components/hrm/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { policyCategoryLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

import { DownloadPolicyButton } from './download-policy-button';
import { ImportPdfButton } from './import-pdf-button';
import { PolicyVersionHistory } from './policy-version-history';

import { Policy, PolicyVersion } from '@/types/hrm';

type PolicyEditorPageContentProps = {
  policyId: string;
};

/** Four actions share the header, so they run one size down from the usual
 *  `sm` to avoid crowding it. */
const compactButton = 'h-8 gap-1.5 px-2.5 text-xs [&_svg]:size-3.5';

export function PolicyEditorPageContent({
  policyId,
}: PolicyEditorPageContentProps) {
  const queryClient = useQueryClient();
  const { data: policy, isLoading } = usePolicy(policyId);
  const { data: employees } = useActiveEmployees();
  const { data: acknowledgments } = useAllPolicyAcknowledgments();

  const [draftHtml, setDraftHtml] = useState<string | null>(null);
  // CKEditor's `data` prop only seeds the *initial* content — it doesn't
  // reactively re-sync on prop changes — so a revert has to force a fresh
  // mount to actually show the reverted content in the editor.
  const [editorKey, setEditorKey] = useState(0);

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

  const handleRevert = (version: PolicyVersion) => {
    setDraftHtml(version.contentHtml);
    setEditorKey((key) => key + 1);
    toast.info(
      `Version ${version.version} loaded into the editor — publish to make it current, or discard changes to go back.`,
    );
  };

  const handleDiscard = () => {
    setDraftHtml(null);
    setEditorKey((key) => key + 1);
    toast.info(`Draft discarded — back to version ${latest.version}.`);
  };

  const handlePdfImported = (html: string) => {
    setDraftHtml(html);
    setEditorKey((key) => key + 1);
  };

  const handlePublish = () => {
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
        <ImportPdfButton
          size='sm'
          className={compactButton}
          onImported={handlePdfImported}
        />
        <DownloadPolicyButton
          size='sm'
          className={compactButton}
          policy={policy}
          version={latest}
        />
        <Button
          variant='outline'
          size='sm'
          className={compactButton}
          iconLeft={Undo2}
          disabled={!isDirty}
          onClick={handleDiscard}
        >
          Discard changes
        </Button>
        <ConfirmDialog
          trigger={
            <Button
              size='sm'
              className={compactButton}
              iconLeft={Send}
              disabled={!isDirty}
            >
              Publish update
            </Button>
          }
          title='Publish this update?'
          description='Employees who already acknowledged an earlier version will see the changed lines highlighted and be prompted to re-acknowledge.'
          confirmLabel='Publish new version'
          onConfirm={handlePublish}
        />
      </PageHeader>

      <RichTextEditor key={editorKey} value={content} onChange={setDraftHtml} />

      <div className='flex flex-col gap-3'>
        <h2 className='text-lg font-semibold'>Version history</h2>
        <PolicyVersionHistory
          policy={policy}
          versions={policy.versions}
          currentVersionNumber={latest.version}
          employees={employees ?? []}
          acknowledgments={(acknowledgments ?? []).filter(
            (ack) => ack.policyId === policy.id,
          )}
          onRevert={handleRevert}
        />
      </div>
    </>
  );
}
