'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { generateMonthlyData } from './utils';
import { useMemo } from 'react';
import type { PhaseData } from './types';

interface MonthlyChartProps {
  phases: PhaseData[];
  selectedDate?: Date;
}

/**
 * 월간 일별 활동 시간 차트
 */
export function MonthlyChart({
  phases,
  selectedDate = new Date(),
}: MonthlyChartProps) {
  const chartData = useMemo(() => {
    const monthlyData = generateMonthlyData(phases, selectedDate);

    // 차트용 데이터 변환 (날짜를 일(day)로만 표시)
    return monthlyData.map((day) => {
      const dayOfMonth = new Date(day.date).getDate();
      return {
        day: dayOfMonth,
        분: day.totalMinutes, // 분 단위
        시간: Math.round((day.totalMinutes / 60) * 10) / 10,
      };
    });
  }, [phases, selectedDate]);

  const hasData = chartData.some((d) => d.분 > 0);

  if (!hasData) {
    return (
      <Card className='p-4'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold'>일별 활동 시간</h3>
          <p className='text-sm text-muted-foreground'>
            이번 달 일별 총 활동 시간
          </p>
        </div>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-4'>
      <div className='mb-4'>
        <h3 className='text-lg font-semibold'>일별 활동 시간</h3>
        <p className='text-sm text-muted-foreground'>
          이번 달 일별 총 활동 시간
        </p>
      </div>
      <div className='h-[300px] w-full'>
        <ResponsiveContainer width='100%' height={300} minHeight={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#333' />
            <XAxis
              dataKey='day'
              stroke='#888'
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke='#888'
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}분`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f1f1f',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              labelFormatter={(value) => `${value}일`}
              formatter={(value) => [`${value}분`, '활동 시간']}
            />
            <Bar dataKey='분' fill='#3b82f6' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
