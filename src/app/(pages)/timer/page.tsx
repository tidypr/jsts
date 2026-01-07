import { auth } from '@/auth';
import TimerPage from '@/client-pages/timer/page';
import { redirect } from 'next/dist/client/components/navigation';

export default async function page() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect('/auth/login');
  }

  return (
    <>
      <TimerPage userId={session.user.id} />
    </>
  );
}
