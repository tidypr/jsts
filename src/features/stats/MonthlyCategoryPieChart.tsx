'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { calculateMonthlyCategoryTotals } from './utils';
import { useMemo } from 'react';
import type { PhaseData } from './types';

interface MonthlyCategoryPieChartProps {
  phases: PhaseData[];
  selectedDate?: Date;
}

/**
 * 월간 카테고리별 파이 차트
 */
export function MonthlyCategoryPieChart({
  phases,
  selectedDate = new Date(),
}: MonthlyCategoryPieChartProps) {
  const chartData = useMemo(() => {
    const categoryTotals = calculateMonthlyCategoryTotals(phases, selectedDate);

    return categoryTotals.map((cat) => ({
      name: cat.category,
      value: cat.hours,
      percentage: cat.percentage,
      color: '#6b7280', // 기본 색상
    }));
  }, [phases, selectedDate]);

  if (chartData.length === 0) {
    return (
      <Card className='p-4'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold'>카테고리별 시간 분포</h3>
          <p className='text-sm text-muted-foreground'>
            이번 달 카테고리별 활동 시간 비율
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
        <h3 className='text-lg font-semibold'>카테고리별 시간 분포</h3>
        <p className='text-sm text-muted-foreground'>
          이번 달 카테고리별 활동 시간 비율
        </p>
      </div>
      <div className='h-[300px] w-full'>
        <ResponsiveContainer width='100%' height={300} minHeight={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={(props) => {
                const entry = chartData[props.index];
                return `${entry.name} ${entry.percentage}%`;
              }}
              outerRadius={80}
              fill='#8884d8'
              dataKey='value'
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f1f1f',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              formatter={(value) => `${value}시간`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
