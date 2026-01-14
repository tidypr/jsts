'use client';

import { useGoals } from './hooks/useGoals';
import { GoalCard } from './components/GoalCard';
import { Loader2, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';

export function GoalsPage() {
  const { data: goals, isLoading, error } = useGoals();

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-[#22c55e]' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-destructive'>목표를 불러오는 중 오류가 발생했습니다</p>
      </div>
    );
  }

  const dailyGoal = goals?.find((goal) => goal.type === 'DAILY');
  const weeklyGoal = goals?.find((goal) => goal.type === 'WEEKLY');
  const monthlyGoal = goals?.find((goal) => goal.type === 'MONTHLY');

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <main className='flex flex-1 flex-col p-6 pb-20'>
        {/* Header */}
        <div className='mb-6'>
          <div className='mb-3 flex items-center gap-3'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#16a34a]'>
              <Target className='h-7 w-7 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>목표 설정</h1>
              <p className='text-sm text-muted-foreground'>
                나만의 목표 시간을 설정하고 달성해보세요
              </p>
            </div>
          </div>
        </div>

        {/* Goal Cards */}
        <div className='space-y-4'>
          <GoalCard type='DAILY' goal={dailyGoal} />
          <GoalCard type='WEEKLY' goal={weeklyGoal} />
          <GoalCard type='MONTHLY' goal={monthlyGoal} />
        </div>

        {/* Tips Section */}
        <Card className='mt-6 border-none bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:from-blue-950/20 dark:to-indigo-950/20'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10'>
              <Lightbulb className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
            <h3 className='font-bold text-foreground'>💡 목표 설정 팁</h3>
          </div>
          <ul className='space-y-2 text-sm text-muted-foreground'>
            <li className='flex items-start gap-2'>
              <span className='mt-0.5 text-blue-600 dark:text-blue-400'>•</span>
              <span>달성 가능한 현실적인 목표를 설정하세요</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='mt-0.5 text-blue-600 dark:text-blue-400'>•</span>
              <span>일간 목표는 매일 자정에 초기화됩니다</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='mt-0.5 text-blue-600 dark:text-blue-400'>•</span>
              <span>주간 목표는 매주 월요일에 초기화됩니다</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='mt-0.5 text-blue-600 dark:text-blue-400'>•</span>
              <span>월간 목표는 매월 1일에 초기화됩니다</span>
            </li>
          </ul>
        </Card>

        {/* Motivation Section */}
        <Card className='mt-4 border-none bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:from-green-950/20 dark:to-emerald-950/20'>
          <div className='mb-2 flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10'>
              <TrendingUp className='h-4 w-4 text-green-600 dark:text-green-400' />
            </div>
            <h3 className='font-bold text-foreground'>🚀 동기부여</h3>
          </div>
          <p className='text-sm text-muted-foreground'>
            작은 목표부터 시작해서 점진적으로 늘려가세요. 꾸준함이 가장 중요합니다!
          </p>
        </Card>
      </main>
    </div>
  );
}
