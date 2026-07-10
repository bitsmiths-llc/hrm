import { Construction } from 'lucide-react';

import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';

type ComingSoonProps = {
  title: string;
  description: string;
};

/** Placeholder for routes whose module slice hasn't been built yet, so no
 *  sidebar link ever 404s during the frontend-first phase. */
export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Construction}
        title='This module is on the way'
        description='The screens for this section are being built module by module. Check back soon.'
      />
    </>
  );
}
