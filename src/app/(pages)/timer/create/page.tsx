import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PhaseFormpage from '@/client-pages/timer/create/page';

export default async function page() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect('/auth/login');
  }

  return (
    <>
      <PhaseFormpage />
    </>
  );
}
