'use client';

import { pdf } from '@react-pdf/renderer';
import { Eye } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { PayslipPdfDocument } from './payslip-pdf-document';

import { Payslip } from '@/types/hrm';

type ViewInvoiceButtonProps = {
  payslip: Payslip;
};

/** Opens the payslip PDF in a new tab instead of downloading it, for a
 *  quick look before deciding whether to send it. */
export function ViewInvoiceButton({ payslip }: ViewInvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleView = async () => {
    setIsGenerating(true);
    const blob = await pdf(<PayslipPdfDocument payslip={payslip} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsGenerating(false);
  };

  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      isLoading={isGenerating}
      onClick={handleView}
      title='View invoice'
      aria-label='View invoice'
    >
      <Eye className='size-4' />
    </Button>
  );
}
