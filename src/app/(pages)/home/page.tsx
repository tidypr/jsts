import { auth } from '@/auth';
import Homepage from '@/client-pages/home/page';
import { redirect } from 'next/dist/client/components/navigation';

export default async function Home() {
  const session = await auth();

  if (!session?.accessToken || !session?.user?.id) {
    redirect('/auth/login');
  }

  return <Homepage userId={session.user.id} />;
}
