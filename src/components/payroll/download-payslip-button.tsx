'use client';

import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { PayslipPdfDocument } from './payslip-pdf-document';

import { Payslip } from '@/types/hrm';

type DownloadPayslipButtonProps = {
  payslip: Payslip;
  className?: string;
  /** Renders as a bare ghost icon button (for a dense table row) instead of
   *  the full-width labeled button used in a detail sheet footer. */
  iconOnly?: boolean;
};

export function DownloadPayslipButton({
  payslip,
  className,
  iconOnly,
}: DownloadPayslipButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    const blob = await pdf(<PayslipPdfDocument payslip={payslip} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payslip-${payslip.cycleMonth}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    setIsGenerating(false);
  };

  if (iconOnly) {
    return (
      <Button
        type='button'
        variant='ghost'
        size='icon'
        isLoading={isGenerating}
        onClick={handleDownload}
        className={className}
        title='Download payslip PDF'
        aria-label='Download payslip PDF'
      >
        <Download className='size-4' />
      </Button>
    );
  }

  return (
    <Button
      variant='outline'
      iconLeft={Download}
      isLoading={isGenerating}
      onClick={handleDownload}
      className={className}
    >
      Download PDF
    </Button>
  );
}
