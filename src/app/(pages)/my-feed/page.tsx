import { auth } from '@/auth';
import MyFeedPage from './MyFeedPage';
import { redirect } from 'next/navigation';

export default async function MyFeed() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  // 세션에서 사용자 ID 가져오기
  const userId = session.user.id || '';

  return <MyFeedPage userId={userId} />;
}
