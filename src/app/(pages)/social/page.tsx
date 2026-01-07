import { auth } from '@/auth';
import Social from '@/client-pages/social/page';

import { redirect } from 'next/dist/client/components/navigation';

export default async function SocialPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect('/auth/login');
  }

  return (
    <>
      <Social session={session} />
    </>
  );
}
