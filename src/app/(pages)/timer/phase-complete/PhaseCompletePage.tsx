'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PhaseComplete from '@/features/timerlist/PhaseComplete';

interface PhaseCompletePageProps {
  userId: string;
}

export default function PhaseCompletePage({ userId }: PhaseCompletePageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const completedTime = Number(searchParams.get('completedTime')) || 10;
  const color = searchParams.get('color') || '#22c55e';
  const phaseId = searchParams.get('phaseId') || null;
  const category = searchParams.get('category') || '집중 활동';

  useEffect(() => {
    // 필수 파라미터가 없으면 타이머 목록으로 돌아감
    if (!searchParams.get('completedTime') || !searchParams.get('phaseId')) {
      router.replace('/timer');
    }
  }, [searchParams, router]);

  const handleConfirm = () => {
    router.push('/timer');
  };

  return (
    <div className='mx-auto flex min-h-screen max-w-md items-center justify-center space-y-4 overflow-hidden p-4'>
      <PhaseComplete
        completedTime={completedTime}
        onConfirm={handleConfirm}
        userId={userId}
        color={color}
        phaseId={phaseId}
        category={category}
      />
    </div>
  );
}
