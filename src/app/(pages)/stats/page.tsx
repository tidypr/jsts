import { auth } from '@/auth';
import { redirect } from 'next/dist/client/components/navigation';
import StatsPage from './StatsPage';

export default async function Stats() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  return (
    <>
      <StatsPage userId={session.user.id} />
    </>
  );
}
