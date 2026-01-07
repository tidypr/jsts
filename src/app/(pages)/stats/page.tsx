import { auth } from '@/auth';
import StatsPage from '@/client-pages/stats/page';

import { redirect } from 'next/dist/client/components/navigation';

export default async function page() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect('/auth/login');
  }

  return (
    <>
      <StatsPage />
    </>
  );
}
