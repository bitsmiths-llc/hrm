import { renderToBuffer } from '@react-pdf/renderer';
import 'server-only';

import { PayslipPdfDocument } from '@/components/payroll/payslip-pdf-document';

import { Payslip } from '@/types/hrm';

/** Filename the invoice PDF is attached under — mirrors the name the employee's
 *  own "Download PDF" button saves it as (`download-payslip-button.tsx`). */
export const payslipFileName = (payslip: Payslip) =>
  `payslip-${payslip.cycleMonth}.pdf`;

/**
 * Render the payslip PDF to a Node Buffer, for mailing as an attachment. The
 * browser paths (`download-payslip-button`, `view-invoice-button`) render the
 * same document component via `pdf().toBlob()`; `renderToBuffer` is the Node
 * build's equivalent.
 *
 * `@react-pdf/renderer` ships a browser and a Node build behind a `browser`
 * export condition, and only the Node one exposes `renderToBuffer` — hence the
 * `serverExternalPackages` entry in `next.config.ts`, which keeps the bundler
 * out of the way so the Node build is what actually loads here.
 */
export const renderPayslipPdf = (payslip: Payslip): Promise<Buffer> =>
  renderToBuffer(<PayslipPdfDocument payslip={payslip} />);
