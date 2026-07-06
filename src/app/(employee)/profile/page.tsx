import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <ComingSoon
      title='My Profile'
      description='Your personal, bank, and employment information.'
    />
  );
}
