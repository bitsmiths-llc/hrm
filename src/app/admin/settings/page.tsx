import { redirect } from 'next/navigation';

import { paths } from '@/constants/paths';

/** Settings were folded into the Policies page ("Configuration" tab), since
 *  they're the numeric side of the same policies. Old links land there. */
export default function SettingsPage() {
  redirect(paths.admin.policies);
}
