'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { TimerIcon, TrendingUp, Zap } from 'lucide-react';

// import { createSession } from '@/shared/actions/session.action';
import CheckCircle from './CheckCircle';
import { useCreatePhase } from '../PhaseForm/hooks/useCreatePhase';
import CountDown from './CountDown';

interface TimerCompleteProps {
  completedTime: number;
  onConfirm: () => void;
  userId: string;
  color?: string;
}

export default function PhaseComplete({
  completedTime,
  onConfirm,
  userId,
  color = '#22c55e',
}: TimerCompleteProps) {
  const { mutate: createPhase, isPending } = useCreatePhase();
  const [category] = useState<string>(color);
  const [note] = useState<string>('');

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
    if (!userId) {
      return;
    }

    const now = new Date();
    const endTime = now;
    const startTime = new Date(now.getTime() - completedTime * 1000);

    const sessionData = {
      userId,
      category,
      date: now,
      startTime,
      endTime,
      note,
    };

    createPhase(sessionData, {
      onSuccess: () => {
        onConfirm();
      },
      onError: () => {
        // Handle error silently or show user feedback
      },
    });
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
            <div className='text-xl font-bold text-[#22c55e]'>150 포인트</div>
          </div>
        </Card>

        <Card className='border-[#1f1f1f] p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e]/20'>
                <TrendingUp className='h-5 w-5 text-[#22c55e]' />
              </div>
              <div>
                <p className='text-sm font-medium'>출석 체크</p>
                <p className='text-xs text-muted-foreground'>연속 출석 달성</p>
              </div>
            </div>
            <div className='text-xl font-bold text-[#22c55e]'>365 일</div>
          </div>
        </Card>
      </div>

      {/* Confirm Button */}
      <div>
        <Button
          onClick={handleConfirm}
          disabled={isPending}
          className='w-full bg-[#22c55e] py-6 text-lg font-semibold text-black hover:bg-[#22c55e]/90 disabled:opacity-50'
        >
          {isPending ? '저장 중...' : '저장'}
        </Button>
        <span className='flex justify-end py-2 text-end text-sm text-muted-foreground'>
          <CountDown handleConfirm={handleConfirm} />
        </span>
      </div>
    </div>
  );
}
