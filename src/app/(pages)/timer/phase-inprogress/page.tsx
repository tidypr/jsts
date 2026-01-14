import { auth } from '@/auth';
import PhaseInProgressPage from './PhaseInProgressPage';
import Link from 'next/link';

export default async function PhaseInProgress() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <>
        <div>로그인이 필요합니다.</div>
        <Link href='/login'>로그인 페이지로 이동</Link>
      </>
    );
  }

  return <PhaseInProgressPage userId={session.user.id} />;
}
