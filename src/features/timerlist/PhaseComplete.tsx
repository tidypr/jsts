'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { TimerIcon, Zap, Share2, Calendar } from 'lucide-react';

import CheckCircle from './CheckCircle';
import { useSharePhaseToFeed } from '../PhaseForm/hooks/useSharePhaseToFeed';
import CountDown from './CountDown';
import { toast } from 'sonner';
import { getAttendanceStreakAction } from '../PhaseForm/actions/getAttendanceStreak.action';

interface TimerCompleteProps {
  completedTime: number;
  onConfirm: () => void;
  userId: string;
  color?: string;
  phaseId: string | null;
  category?: string;
}

export default function PhaseComplete({
  completedTime,
  onConfirm,
  userId,
  phaseId,
  category = '집중 활동',
}: TimerCompleteProps) {
  const { mutate: shareToFeed, isPending: isSharing } = useSharePhaseToFeed();
  const [note] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(false);
  const [attendanceStreak, setAttendanceStreak] = useState<number>(0);

  // 출석 연속일수 가져오기
  useEffect(() => {
    const fetchAttendanceStreak = async () => {
      const result = await getAttendanceStreakAction(userId);
      if (result.success) {
        setAttendanceStreak(result.data);
      }
    };

    fetchAttendanceStreak();
  }, [userId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours} 시간 ${mins} 분`;
    }
    return mins > 0 ? `${mins} 분 ${secs} 초` : `${secs} 초`;
  };

  const handleConfirm = () => {
    // Phase는 이미 타이머 완료 시 자동 저장되었으므로 바로 타이머 목록으로 이동
    onConfirm();
  };

  const handleShareToFeed = () => {
    if (!userId || !phaseId) {
      console.error('userId 또는 phaseId가 없습니다');
      return;
    }

    shareToFeed(
      {
        userId,
        phaseId,
        category,
        completedTime,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setIsShared(true);
          toast.success('피드에 공유되었습니다! 🎉');
        },
        onError: (error) => {
          console.error('Feed 공유 실패:', error);
          toast.error('피드 공유 중 오류가 발생했습니다.');
        },
      },
    );
  };

  return (
    <div className='w-full space-y-8'>
      {/* Success Icon */}
      <div className='flex flex-col items-center justify-center space-y-4'>
        <div className='relative'>
          <CheckCircle />
        </div>
        <div className='text-center'>
          <h1 className='mb-2 text-3xl font-bold'>훌륭해요!</h1>
          <p className='text-muted-foreground'>목표를 달성했습니다</p>
        </div>
      </div>

      {/* Rewards */}
      <div className='space-y-2'>
        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e]/20'>
                <TimerIcon className='h-5 w-5 text-[#22c55e]' />
              </div>
              <div>
                <p className='text-sm font-medium'>집중 시간</p>
                <p className='text-xs text-muted-foreground'>경험치 보상</p>
              </div>
            </div>
            <div className='text-xl font-bold text-[#22c55e]'>
              {formatTime(completedTime)}
            </div>
          </div>
        </Card>

        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e]/20'>
                <Zap className='h-5 w-5 text-[#22c55e]' />
              </div>
              <div>
                <p className='text-sm font-medium'>포인트 획득</p>
                <p className='text-xs text-muted-foreground'>경험치 보상</p>
              </div>
            </div>
            <div className='text-xl font-bold text-[#22c55e]'>{`${Math.trunc(completedTime / 60)} 포인트`}</div>
          </div>
        </Card>

        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e]/20'>
                <Calendar className='h-5 w-5 text-[#22c55e]' />
              </div>
              <div>
                <p className='text-sm font-medium'>출석 체크</p>
                <p className='text-xs text-muted-foreground'>연속 출석 달성</p>
              </div>
            </div>
            <div className='text-xl font-bold text-[#22c55e]'>
              {attendanceStreak} 일
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className='space-y-3'>
        {/* Share Button */}
        <Button
          onClick={handleShareToFeed}
          disabled={isSharing || isShared}
          className='w-full border-[#22c55e] bg-transparent py-6 text-lg font-semibold text-[#22c55e] hover:bg-[#22c55e]/10 disabled:opacity-50'
          variant='outline'
        >
          {isSharing ? (
            '공유 중...'
          ) : isShared ? (
            <>
              <Share2 className='mr-2 h-5 w-5' />
              공유 완료 ✓
            </>
          ) : (
            <>
              <Share2 className='mr-2 h-5 w-5' />
              피드에 기록하기
            </>
          )}
        </Button>

        {/* Confirm Button */}
        <div>
          <Button
            onClick={handleConfirm}
            className='w-full bg-[#22c55e] py-6 text-lg font-semibold text-black hover:bg-[#22c55e]/90'
          >
            확인
          </Button>
          <span className='flex justify-end py-2 text-end text-sm text-muted-foreground'>
            <CountDown handleConfirm={handleConfirm} />
          </span>
        </div>
      </div>
    </div>
  );
}
