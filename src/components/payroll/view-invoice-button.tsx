'use client';

import { Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

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
    try {
      // Pulled in on click, not at import: the renderer is ~500 kB of client JS,
      // and this button sits on every row of a grid whose actual job is editing
      // figures. Most visits never preview a PDF, so they shouldn't pay for one.
      const [{ pdf }, { PayslipPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./payslip-pdf-document'),
      ]);
      const blob = await pdf(<PayslipPdfDocument payslip={payslip} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Could not open the invoice preview.');
    } finally {
      // Always clears: without it a failed render leaves the row's button
      // spinning with no way back.
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      isLoading={isGenerating}
      onClick={handleView}
      title={`View ${payslip.employeeName}'s invoice`}
      aria-label={`View ${payslip.employeeName}'s invoice`}
    >
      <Eye className='size-4' />
    </Button>
  );
}
