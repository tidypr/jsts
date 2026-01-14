'use client';

import { Card } from '@/shared/components/ui/card';
import { useState, useEffect } from 'react';
import type { PhaseData } from './types';
import { WeeklyChart } from './WeeklyChart';
import { MonthlyChart } from './MonthlyChart';
import { MonthlyCategoryPieChart } from './MonthlyCategoryPieChart';
import { MonthlySummaryCards } from './MonthlySummaryCards';
import YearlyChart from './YearlyChart';
import DailyActivityDashboard from './DailyActivityDashboard';
import { getUserPhasesAction } from './getPhases.action';
import {
  DailyCumulativeChart,
  DailyCategoryBarChart,
  DailyHourlyPattern,
} from './DailyCharts';
import {
  WeeklyCumulativeChart,
  WeeklyCategoryAreaChart,
  WeeklyAverageComparisonChart,
} from './WeeklyCharts';
import {
  MonthlyCumulativeAreaChart,
  MonthlyWeeklyComparisonChart,
  MonthlyGoalProgressChart,
} from './MonthlyCharts';
import { PeriodStats } from './PeriodStats';

interface StatsPageProps {
  userId: string;
}

type TabType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function StatsPage({
  userId,
  tab,
}: StatsPageProps & { tab: TabType }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [phases, setPhases] = useState<PhaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const activeTab = tab;

  // Phase 데이터 로드
  useEffect(() => {
    const loadPhases = async () => {
      setLoading(true);
      const result = await getUserPhasesAction(userId, true);
      if (result.success) {
        setPhases(result.data);
      }
      setLoading(false);
    };

    loadPhases();
  }, [userId]);

  // 탭에 따른 통계 계산
  // const stats: StatsData = useMemo(() => {
  //   if (phases.length === 0) {
  //     return {
  //       totalTime: 0,
  //       totalTimeChange: 0,
  //       avgTime: 0,
  //       avgTimeChange: 0,
  //       streak: 0,
  //       categoryTime: {},
  //       dailyTime: [],
  //     };
  //   }

  //   switch (activeTab) {
  //     case 'daily':
  //       return calculateDailyStats(phases, selectedDate);
  //     case 'weekly':
  //       return calculateWeeklyStats(phases, selectedDate);
  //     case 'monthly':
  //       return calculateMonthlyStats(phases, selectedDate);
  //     default:
  //       return calculateDailyStats(phases, selectedDate);
  //   }
  // }, [activeTab, selectedDate, phases]);

  // // 통계 데이터
  // const totalTime = formatTime(stats.totalTime);
  // const totalTimeChange = stats.totalTimeChange;
  // const avgTime = formatTime(stats.avgTime);
  // const avgTimeChange = stats.avgTimeChange;
  // const streak = stats.streak;

  // // 선택된 날짜 표시
  // const selectedMonth = format(selectedDate, 'yyyy년 M월');

  // // 날짜 변경 핸들러
  // const handlePreviousMonth = () => {
  //   setSelectedDate(subMonths(selectedDate, 1));
  // };

  // const handleNextMonth = () => {
  //   setSelectedDate(addMonths(selectedDate, 1));
  // };

  if (loading) {
    return (
      <div className='min-h-screen w-full px-4 pb-24 pt-6'>
        <div className='flex items-center justify-center py-12'>
          <p className='text-muted-foreground'>통계 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full pb-24'>
      <div className='space-y-6'>
        {/* Summary Cards */}
        {/* <div className='space-y-3'>
          <Card className='p-4'>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>총 활동 시간</p>
              <p className='text-3xl font-bold'>{totalTime}</p>
              <div
                className={`flex items-center gap-1 text-xs ${
                  totalTimeChange >= 0 ? 'text-[#22c55e]' : 'text-red-500'
                }`}
              >
                <TrendingUp className='h-3 w-3' />
                <span>
                  {totalTimeChange > 0 ? '+' : ''}
                  {totalTimeChange}%
                </span>
              </div>
            </div>
          </Card>

          <Card className='p-4'>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>평균 활동시간</p>
              <p className='text-3xl font-bold'>{avgTime}</p>
              <div
                className={`flex items-center gap-1 text-xs ${
                  avgTimeChange >= 0 ? 'text-[#22c55e]' : 'text-red-500'
                }`}
              >
                <TrendingUp className='h-3 w-3' />
                <span>
                  {avgTimeChange > 0 ? '+' : ''}
                  {avgTimeChange}%
                </span>
              </div>
            </div>
          </Card>

          <Card className='p-4'>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>연속 기록</p>
              <p className='text-3xl font-bold'>{streak}</p>
              <p className='text-xs text-muted-foreground'>Days Streak</p>
            </div>
          </Card>
        </div> */}

        {/* Charts based on active tab */}
        {activeTab === 'daily' && (
          <>
            <PeriodStats
              phases={phases}
              period='daily'
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <DailyHourlyPattern phases={phases} />
          </>
        )}

        {activeTab === 'weekly' && (
          <>
            <PeriodStats
              phases={phases}
              period='weekly'
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <DailyCategoryBarChart phases={phases} />
            <DailyCumulativeChart phases={phases} />
            <WeeklyCumulativeChart phases={phases} />
            <WeeklyCategoryAreaChart phases={phases} />
            <WeeklyAverageComparisonChart phases={phases} />
            <WeeklyChart phases={phases} />
          </>
        )}

        {activeTab === 'monthly' && (
          <>
            <PeriodStats
              phases={phases}
              period='monthly'
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <DailyActivityDashboard phases={phases} />
            <MonthlySummaryCards phases={phases} selectedDate={selectedDate} />
            <MonthlyCumulativeAreaChart
              phases={phases}
              selectedDate={selectedDate}
            />
            <MonthlyWeeklyComparisonChart
              phases={phases}
              selectedDate={selectedDate}
            />
            <MonthlyGoalProgressChart
              phases={phases}
              selectedDate={selectedDate}
            />
            <MonthlyChart phases={phases} selectedDate={selectedDate} />
            <MonthlyCategoryPieChart
              phases={phases}
              selectedDate={selectedDate}
            />
          </>
        )}

        {activeTab === 'yearly' && <YearlyChart phases={phases} />}

        {phases.length === 0 && (
          <Card className='p-8'>
            <div className='text-center text-muted-foreground'>
              <p>아직 활동 데이터가 없습니다.</p>
              <p className='mt-2 text-sm'>타이머로 활동을 기록해보세요!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
