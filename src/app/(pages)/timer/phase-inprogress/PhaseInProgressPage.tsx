'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Timer } from '@/features/timer';
import { startPhaseAction } from '@/features/PhaseForm/actions/startPhase.action';

interface PhaseInProgressProps {
  userId: string;
}

export default function PhaseInProgress({ userId }: PhaseInProgressProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTime = Number(searchParams.get('time')) || 1500;
  const goalTitle = searchParams.get('title') || '타이머';
  const color = searchParams.get('color') || '#22c55e';
  const templateId = searchParams.get('templateId') || '';
  const urlPhaseId = searchParams.get('phaseId') || null;

  // 상태: Phase ID와 로딩 상태
  const [phaseId, setPhaseId] = useState<string | null>(urlPhaseId);
  const [isLoading, setIsLoading] = useState(!urlPhaseId); // phaseId 없으면 로딩
  const [error, setError] = useState<string | null>(null);

  const initRef = useRef(false);
  const isCreatingRef = useRef(false);

  useEffect(() => {
    // phaseId가 URL에 이미 있으면 Phase 생성 스킵
    if (urlPhaseId) {
      return;
    }

    // 이미 초기화되었으면 스킵
    if (initRef.current) {
      return;
    }

    // 필수 파라미터 체크
    if (!searchParams.get('time') || !searchParams.get('title')) {
      const timer = setTimeout(() => {
        router.replace('/timer');
      }, 0);
      return () => clearTimeout(timer);
    }

    // 이미 생성 중이면 스킵 (중복 방지)
    if (isCreatingRef.current) {
      return;
    }

    initRef.current = true;
    isCreatingRef.current = true;

    // Phase 생성 (fallback: Phase가 미리 생성되지 않은 경우)
    const createPhase = async () => {
      try {
        setIsLoading(true);

        // templateId가 있어야 Phase를 생성할 수 있습니다
        if (!templateId) {
          setError('템플릿이 필요합니다. 타이머 페이지로 돌아가세요.');
          setIsLoading(false);
          return;
        }

        const result = await startPhaseAction({
          userId,
          templateId,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        setPhaseId(result.data.id);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        setIsLoading(false);
      } finally {
        isCreatingRef.current = false;
      }
    };

    createPhase();
  }, [urlPhaseId, userId, color, goalTitle, searchParams, router, templateId]);

  const handleClose = () => {
    router.push('/timer');
  };

  // 에러 처리
  if (error) {
    return (
      <div className='mx-auto flex h-[400px] max-w-md items-center justify-center p-4'>
        <div className='text-center'>
          <p className='text-red-500'>타이머를 준비하는데 실패했습니다.</p>
          <p className='mt-2 text-sm text-muted-foreground'>{error}</p>
          <button
            onClick={() => router.push('/timer')}
            className='mt-4 text-primary underline'
          >
            타이머 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className='mx-auto flex h-[400px] max-w-md items-center justify-center p-4'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-muted-foreground'>타이머를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // Timer 렌더링
  return (
    <div className='flex min-h-screen items-center justify-center space-y-4 p-4'>
      <Timer
        key={`${templateId}-${phaseId}`}
        userId={userId}
        initialTime={initialTime}
        goalTitle={goalTitle}
        color={color}
        onClose={handleClose}
        autoStart={true}
        phaseId={phaseId}
      />
    </div>
  );
}
