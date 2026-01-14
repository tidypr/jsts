import { auth } from '@/auth';
import HistoryPage from './HistoryPage';
import { redirect } from 'next/navigation';

export default async function History() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  return <HistoryPage userId={session.user.id} />;
}
