'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { calculatePhaseDuration } from './utils';
import type { PhaseData } from './types';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from 'date-fns';

const DEFAULT_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#6366f1',
  '#6b7280',
];

interface WeeklyChartsProps {
  phases: PhaseData[];
}

/**
 * 주간 일별 활동 시간 + 목표 대비 (Line + Bar)
 */
export function WeeklyCumulativeChart({ phases }: WeeklyChartsProps) {
  const chartData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    let cumulative = 0;

    return daysInWeek.map((date) => {
      const dateStr = date.toISOString().split('T')[0];

      const dayPhases = phases.filter((phase) => {
        if (!phase.startTime || phase.status !== 'COMPLETED') return false;
        const phaseDate = new Date(phase.startTime);
        const phaseDateStr = phaseDate.toISOString().split('T')[0];
        return phaseDateStr === dateStr;
      });

      const dayMinutes = dayPhases.reduce(
        (sum, phase) => sum + calculatePhaseDuration(phase),
        0,
      );

      cumulative += dayMinutes;

      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][
        date.getDay()
      ];

      return {
        day: `${format(date, 'MM/dd')} (${dayOfWeek})`,
        일간: Math.round((dayMinutes / 60) * 10) / 10,
        누적: Math.round((cumulative / 60) * 10) / 10,
        목표: 8, // 일일 목표 8시간
      };
    });
  }, [phases]);

  const hasData = chartData.some((d) => d.일간 > 0);

  if (!hasData) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>📈 주간 누적 학습 시간</h3>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          이번 주 활동 데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>📈 주간 누적 학습 시간</h3>
      <ResponsiveContainer width='100%' height={300}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient
              id='colorWeeklyCumulative'
              x1='0'
              y1='0'
              x2='0'
              y2='1'
            >
              <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis
            dataKey='day'
            className='text-xs'
            angle={-45}
            textAnchor='end'
            height={80}
          />
          <YAxis
            className='text-xs'
            label={{ value: '시간', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey='일간' fill='#22c55e' radius={[8, 8, 0, 0]} />
          <Line
            type='monotone'
            dataKey='누적'
            stroke='#3b82f6'
            strokeWidth={3}
            dot={{ r: 5 }}
          />
          <Line
            type='monotone'
            dataKey='목표'
            stroke='#ef4444'
            strokeWidth={2}
            strokeDasharray='5 5'
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

/**
 * 주간 카테고리별 시간 분포 (Stacked Area Chart)
 */
export function WeeklyCategoryAreaChart({ phases }: WeeklyChartsProps) {
  const chartData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map((date) => {
      const dateStr = date.toISOString().split('T')[0];

      const dayPhases = phases.filter((phase) => {
        if (!phase.startTime || phase.status !== 'COMPLETED') return false;
        const phaseDate = new Date(phase.startTime);
        const phaseDateStr = phaseDate.toISOString().split('T')[0];
        return phaseDateStr === dateStr;
      });

      const categoryData: Record<string, number> = {};

      dayPhases.forEach((phase) => {
        const category = phase.title || '기타';
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        categoryData[category] += calculatePhaseDuration(phase) / 60;
      });

      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][
        date.getDay()
      ];

      return {
        day: `${format(date, 'MM/dd')} (${dayOfWeek})`,
        ...Object.fromEntries(
          Object.entries(categoryData).map(([key, value]) => [
            key,
            Math.round(value * 10) / 10,
          ]),
        ),
      };
    });
  }, [phases]);

  const hasData = chartData.some((d) =>
    Object.keys(d).some((key) => {
      const value = (d as Record<string, number | string>)[key];
      return key !== 'day' && typeof value === 'number' && value > 0;
    }),
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    chartData.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (key !== 'day') cats.add(key);
      });
    });
    return Array.from(cats);
  }, [chartData]);

  if (!hasData) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>
          📊 주간 카테고리별 시간 추이
        </h3>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          이번 주 활동 데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>
        📊 주간 카테고리별 시간 추이
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis
            dataKey='day'
            className='text-xs'
            angle={-45}
            textAnchor='end'
            height={80}
          />
          <YAxis
            className='text-xs'
            label={{ value: '시간', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {categories.map((category, index) => {
            const color = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
            return (
              <Area
                key={category}
                type='monotone'
                dataKey={category}
                stroke={color}
                fill={color}
                fillOpacity={0.3}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

/**
 * 주간 평균 vs 일별 비교 (Line Chart)
 */
export function WeeklyAverageComparisonChart({ phases }: WeeklyChartsProps) {
  const chartData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dailyHours = daysInWeek.map((date) => {
      const dateStr = date.toISOString().split('T')[0];

      const dayPhases = phases.filter((phase) => {
        if (!phase.startTime || phase.status !== 'COMPLETED') return false;
        const phaseDate = new Date(phase.startTime);
        const phaseDateStr = phaseDate.toISOString().split('T')[0];
        return phaseDateStr === dateStr;
      });

      const dayMinutes = dayPhases.reduce(
        (sum, phase) => sum + calculatePhaseDuration(phase),
        0,
      );

      return dayMinutes / 60;
    });

    const average =
      dailyHours.reduce((sum, h) => sum + h, 0) / dailyHours.length;

    return daysInWeek.map((date, index) => {
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][
        date.getDay()
      ];
      return {
        day: `${format(date, 'MM/dd')} (${dayOfWeek})`,
        실제: Math.round(dailyHours[index] * 10) / 10,
        평균: Math.round(average * 10) / 10,
      };
    });
  }, [phases]);

  const hasData = chartData.some((d) => d.실제 > 0);

  if (!hasData) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>
          📉 주간 평균 vs 일별 활동
        </h3>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          이번 주 활동 데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>📉 주간 평균 vs 일별 활동</h3>
      <ResponsiveContainer width='100%' height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis
            dataKey='day'
            className='text-xs'
            angle={-45}
            textAnchor='end'
            height={80}
          />
          <YAxis
            className='text-xs'
            label={{ value: '시간', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type='monotone'
            dataKey='실제'
            stroke='#22c55e'
            strokeWidth={3}
            dot={{ r: 6 }}
          />
          <Line
            type='monotone'
            dataKey='평균'
            stroke='#f59e0b'
            strokeWidth={2}
            strokeDasharray='5 5'
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
