import { auth } from '@/auth';
import { redirect } from 'next/dist/client/components/navigation';

import SocialPage from './SocialPage';

export default async function Social() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  return (
    <>
      <SocialPage session={session} />
    </>
  );
}
