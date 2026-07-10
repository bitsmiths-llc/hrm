import { Metadata } from 'next';

import { ProfileView } from '@/components/profile/profile-view';

export const metadata: Metadata = { title: 'My Profile' };

export default function AdminProfilePage() {
  return (
    <ProfileView showEmployment={false} canEditPersonal showDocuments={false} />
  );
}
