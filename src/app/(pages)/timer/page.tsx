import { auth } from '@/auth';
import TimerPage from './TimerPage';
import { redirect } from 'next/dist/client/components/navigation';

export default async function Timer() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  return (
    <>
      <TimerPage userId={session.user.id} />
    </>
  );
}
