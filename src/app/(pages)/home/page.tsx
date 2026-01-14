import { auth } from '@/auth';
import HomePage from './HomePage';
import { redirect } from 'next/dist/client/components/navigation';

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  return <HomePage userId={session.user.id} />;
}
