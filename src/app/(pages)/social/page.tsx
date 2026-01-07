import { auth } from '@/auth';
import SocialPage from '@/client-pages/social/page';

import { redirect } from 'next/dist/client/components/navigation';

export default async function page() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect('/auth/login');
  }

  return (
    <>
      <SocialPage session={session} />
    </>
  );
}
