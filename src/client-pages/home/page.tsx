'use client';

import { useState } from 'react';
import PhaseAddBtn from '@/features/Phase/PhaseAddBtn';
import PhaseForm from '@/features/PhaseForm';
import { Card } from '@/shared/components/ui/card';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Award, TrendingUp, Zap, Clock } from 'lucide-react';
import { useRecentPhases } from '@/features/PhaseForm/hooks/useRecentPhases';

interface HomepageProps {
  userId: string;
}

export default function Homepage({ userId }: HomepageProps) {
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const { data: recentPhases, isLoading } = useRecentPhases(userId, 3);
  console.log('recentPhases', recentPhases);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (createdAt: Date, updatedAt: Date) => {
    const start = new Date(createdAt).getTime();
    const end = new Date(updatedAt).getTime();
    const diff = end - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    } else {
      return `${seconds}초`;
    }
  };

  return (
    <>
      <div>
        <h1 className='text-2xl font-bold'>홈</h1>

        {/* Stats Summary */}
        <Card className='border-[#1f1f1f] p-4'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm'>
              <Award className='h-4 w-4 text-[#22c55e]' />
              <span className='text-muted-foreground'>오늘의 세션</span>
              <span className='ml-auto font-medium'>4회</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <Zap className='h-4 w-4 text-[#22c55e]' />
              <span className='text-muted-foreground'>총 집중 시간</span>
              <span className='ml-auto font-medium'>3h 25m</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <TrendingUp className='h-4 w-4 text-[#22c55e]' />
              <span className='text-muted-foreground'>목표 달성률</span>
              <span className='ml-auto font-medium text-[#22c55e]'>85%</span>
            </div>
          </div>
        </Card>

        {/* 최근 활동 */}
        <div className='mt-6'>
          <h2 className='mb-3 text-lg font-semibold'>최근 활동</h2>
          {isLoading ? (
            <Card className='border-[#1f1f1f] p-4'>
              <p className='text-sm text-muted-foreground'>로딩 중...</p>
            </Card>
          ) : !recentPhases || recentPhases.length === 0 ? (
            <Card className='border-[#1f1f1f] p-4'>
              <p className='text-sm text-muted-foreground'>
                최근 활동이 없습니다. Phase를 추가해보세요!
              </p>
            </Card>
          ) : (
            <div className='space-y-2'>
              {recentPhases.map((phase) => (
                <Card
                  key={phase.id}
                  className='border-[#1f1f1f] p-3 transition-colors hover:bg-[#1f1f1f]/50'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: phase.category }}
                    />
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Clock className='h-3 w-3 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            {formatDate(phase.date)}
                          </span>
                        </div>
                        <span className='text-sm font-medium text-[#22c55e]'>
                          {calculateDuration(phase.createdAt, phase.updatedAt)}
                        </span>
                      </div>
                      {phase.note && (
                        <p className='mt-1 text-sm'>{phase.note}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phase Add Button */}
      <PhaseAddBtn onClick={() => setShowPhaseForm(true)} />

      {/* Phase Form Dialog */}
      <Dialog open={showPhaseForm} onOpenChange={setShowPhaseForm}>
        <DialogContent className='max-h-[90vh] overflow-y-auto border-[#1f1f1f] sm:max-w-md'>
          <PhaseForm onClose={() => setShowPhaseForm(false)} userId={userId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
