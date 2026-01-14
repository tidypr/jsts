import { auth } from '@/auth';
import RecordPage from './RecordPage';
import { redirect } from 'next/navigation';

export default async function Record() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  return <RecordPage userId={session.user.id} />;
}
