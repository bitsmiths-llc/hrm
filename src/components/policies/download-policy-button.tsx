'use client';

import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { PolicyPdfDocument } from './policy-pdf-document';

import { Policy, PolicyVersion } from '@/types/hrm';

type DownloadPolicyButtonProps = {
  policy: Pick<Policy, 'title' | 'category'>;
  version: PolicyVersion;
  size?: 'default' | 'sm';
  className?: string;
};

export function DownloadPolicyButton({
  policy,
  version,
  size = 'default',
  className,
}: DownloadPolicyButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    const blob = await pdf(
      <PolicyPdfDocument policy={policy} version={version} />,
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slug = policy.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    link.download = `${slug}-v${version.version}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    setIsGenerating(false);
  };

  return (
    <Button
      variant='outline'
      size={size}
      iconLeft={Download}
      isLoading={isGenerating}
      onClick={handleDownload}
      className={className}
    >
      Download PDF
    </Button>
  );
}
