import { Metadata } from 'next';

import { AcceptInvitationForm } from '@/components/auth/accept-invitation-form';

export const metadata: Metadata = { title: 'Accept invitation' };

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  // The real invitation link will carry a token; email comes from it. Mocked
  // via query param for the frontend phase.
  const { email } = await searchParams;
  return <AcceptInvitationForm email={email ?? 'bilal@bitsmiths.studio'} />;
}
