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
import { calculateDailyTime } from './utils';
import { useMemo } from 'react';
import type { PhaseData } from './types';

interface WeeklyChartProps {
  phases: PhaseData[];
}

/**
 * 주간 일별 활동 시간 차트
 */
export function WeeklyChart({ phases }: WeeklyChartProps) {
  const chartData = useMemo(() => {
    const dailyTime = calculateDailyTime(phases, 7);

    return dailyTime.map((day) => {
      const date = new Date(day.date);
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][
        date.getDay()
      ];
      return {
        day: `${date.getMonth() + 1}/${date.getDate()} (${dayOfWeek})`,
        분: day.time, // 분 단위로 표시
        시간: Math.round((day.time / 60) * 10) / 10,
      };
    });
  }, [phases]);

  // 데이터가 있는지 확인
  const hasData = chartData.some((d) => d.분 > 0);

  if (!hasData) {
    return (
      <Card className='p-4'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold'>주간 활동 추이</h3>
          <p className='text-sm text-muted-foreground'>
            최근 7일간 일별 활동 시간
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
        <h3 className='text-lg font-semibold'>주간 활동 추이</h3>
        <p className='text-sm text-muted-foreground'>
          최근 7일간 일별 활동 시간
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
              fontSize={10}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor='end'
              height={80}
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
              formatter={(value) => [`${value}분`, '활동 시간']}
            />
            <Bar dataKey='분' fill='#22c55e' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
