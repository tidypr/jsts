'use client';

import { Card } from '@/shared/components/ui/card';
import { Calendar, TrendingUp, Target, Award } from 'lucide-react';
import { calculateMonthlySummary, formatTime, getCategoryLabel } from './utils';
import { useMemo } from 'react';
import type { PhaseData } from './types';

interface MonthlySummaryCardsProps {
  phases: PhaseData[];
  selectedDate?: Date;
}

/**
 * 월간 통계 요약 카드
 */
export function MonthlySummaryCards({
  phases,
  selectedDate = new Date(),
}: MonthlySummaryCardsProps) {
  const summary = useMemo(() => {
    return calculateMonthlySummary(phases, selectedDate);
  }, [phases, selectedDate]);

  return (
    <div className='grid grid-cols-2 gap-3'>
      <Card className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='rounded-lg bg-blue-500/10 p-2'>
            <Calendar className='h-5 w-5 text-blue-500' />
          </div>
          <div className='flex-1'>
            <p className='text-xs text-muted-foreground'>총 활동 시간</p>
            <p className='text-2xl font-bold'>
              {formatTime(summary.totalMinutes)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {summary.activeDays}/{summary.totalDays}일 활동
            </p>
          </div>
        </div>
      </Card>

      <Card className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='rounded-lg bg-green-500/10 p-2'>
            <TrendingUp className='h-5 w-5 text-green-500' />
          </div>
          <div className='flex-1'>
            <p className='text-xs text-muted-foreground'>평균 (활동일)</p>
            <p className='text-2xl font-bold'>
              {formatTime(summary.avgMinutesPerActiveDay)}
            </p>
            <p className='text-xs text-muted-foreground'>
              일평균: {formatTime(summary.avgMinutesPerDay)}
            </p>
          </div>
        </div>
      </Card>

      <Card className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='rounded-lg bg-purple-500/10 p-2'>
            <Target className='h-5 w-5 text-purple-500' />
          </div>
          <div className='flex-1'>
            <p className='text-xs text-muted-foreground'>최고 기록</p>
            <p className='text-2xl font-bold'>
              {formatTime(summary.mostProductiveDay.minutes)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {summary.mostProductiveDay.date
                ? new Date(summary.mostProductiveDay.date).getDate() + '일'
                : '-'}
            </p>
          </div>
        </div>
      </Card>

      <Card className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='rounded-lg bg-amber-500/10 p-2'>
            <Award className='h-5 w-5 text-amber-500' />
          </div>
          <div className='flex-1'>
            <p className='text-xs text-muted-foreground'>최다 카테고리</p>
            <p className='text-2xl font-bold'>
              {getCategoryLabel(summary.topCategory.category)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {summary.topCategory.percentage}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
