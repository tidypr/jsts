import { auth } from '@/auth';
import PhaseCompletePage from './PhaseCompletePage';

export default async function TimerPhaseComplete() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>로그인이 필요합니다.</div>;
  }

  return <PhaseCompletePage userId={session.user.id} />;
}
