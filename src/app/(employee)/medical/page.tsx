import { Metadata } from 'next';

import { MedicalPageContent } from '@/components/medical/medical-page-content';

export const metadata: Metadata = { title: 'Medical' };

export default function MedicalPage() {
  return <MedicalPageContent />;
}
