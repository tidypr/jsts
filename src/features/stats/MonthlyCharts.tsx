'use client';

import React, { useMemo } from 'react';
import {
  Line,
  BarChart,
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
  startOfDay,
  startOfMonth,
  endOfMonth,
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

interface MonthlyChartsProps {
  phases: PhaseData[];
  selectedDate?: Date;
}

/**
 * 월간 일별 누적 시간 (Area Chart)
 */
export function MonthlyCumulativeAreaChart({
  phases,
  selectedDate = new Date(),
}: MonthlyChartsProps) {
  const chartData = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    let cumulative = 0;

    return daysInMonth.map((date) => {
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

      return {
        day: date.getDate(),
        일간: Math.round((dayMinutes / 60) * 10) / 10,
        누적: Math.round((cumulative / 60) * 10) / 10,
      };
    });
  }, [phases, selectedDate]);

  const hasData = chartData.some((d) => d.일간 > 0);

  if (!hasData) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>📈 월간 누적 학습 시간</h3>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          이번 달 활동 데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>
        📈 월간 누적 학습 시간 ({format(selectedDate, 'yyyy년 MM월')})
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id='colorMonthlyDaily' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#22c55e' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#22c55e' stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id='colorMonthlyCumulative'
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
            label={{ value: '일', position: 'insideBottom', offset: -5 }}
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
          <Area
            type='monotone'
            dataKey='일간'
            stroke='#22c55e'
            fill='url(#colorMonthlyDaily)'
            fillOpacity={1}
          />
          <Area
            type='monotone'
            dataKey='누적'
            stroke='#3b82f6'
            fill='url(#colorMonthlyCumulative)'
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

/**
 * 월간 주차별 비교 (Bar Chart)
 */
export function MonthlyWeeklyComparisonChart({
  phases,
  selectedDate = new Date(),
}: MonthlyChartsProps) {
  const chartData = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    
    // 월의 1일부터 7일씩 끊어서 주차 계산
    const weeks: { start: Date; end: Date }[] = [];
    let currentStart = new Date(monthStart);
    
    while (currentStart <= monthEnd) {
      const weekEnd = new Date(currentStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // 월의 마지막 날을 넘지 않도록
      if (weekEnd > monthEnd) {
        weeks.push({ start: currentStart, end: monthEnd });
      } else {
        weeks.push({ start: currentStart, end: weekEnd });
      }
      
      // 다음 주 시작일
      currentStart = new Date(weekEnd);
      currentStart.setDate(currentStart.getDate() + 1);
    }

    return weeks.map((week, index) => {
      const weekPhases = phases.filter((phase) => {
        if (!phase.startTime || phase.status !== 'COMPLETED') return false;
        const phaseDate = new Date(phase.startTime);
        const phaseStartOfDay = startOfDay(phaseDate);

        return (
          phaseStartOfDay >= startOfDay(week.start) &&
          phaseStartOfDay <= startOfDay(week.end)
        );
      });

      const categoryData: Record<string, number> = {};

      weekPhases.forEach((phase) => {
        const category = phase.title || '기타';
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        categoryData[category] += calculatePhaseDuration(phase) / 60;
      });

      const totalHours = Object.values(categoryData).reduce(
        (sum, h) => sum + h,
        0,
      );

      return {
        week: `${index + 1}주차`,
        총시간: Math.round(totalHours * 10) / 10,
        ...Object.fromEntries(
          Object.entries(categoryData).map(([key, value]) => [
            key,
            Math.round(value * 10) / 10,
          ]),
        ),
      };
    });
  }, [phases, selectedDate]);

  const hasData = chartData.some((d) => d.총시간 > 0);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    chartData.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (key !== 'week' && key !== '총시간') cats.add(key);
      });
    });
    return Array.from(cats);
  }, [chartData]);

  if (!hasData) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>📊 주차별 활동 비교</h3>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          이번 달 활동 데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>
        📊 주차별 활동 비교 ({format(selectedDate, 'yyyy년 MM월')})
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis dataKey='week' className='text-xs' />
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
              <Bar
                key={category}
                dataKey={category}
                fill={color}
                radius={[4, 4, 0, 0]}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

/**
 * 월간 목표 달성률 (Composed Chart - Bar + Line)
 */
export function MonthlyGoalProgressChart({
  phases,
  selectedDate = new Date(),
}: MonthlyChartsProps) {
  const chartData = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const dailyGoal = 8; // 일일 목표 8시간

    return daysInMonth.map((date) => {
      const dateStr = date.toISOString().split('T')[0];

      const dayPhases = phases.filter((phase) => {
        if (!phase.startTime || phase.status !== 'COMPLETED') return false;
        const phaseDate = new Date(phase.startTime);
        const phaseDateStr = phaseDate.toISOString().split('T')[0];
        return phaseDateStr === dateStr;
      });

      const dayHours = dayPhases.reduce(
        (sum, phase) => sum + calculatePhaseDuration(phase) / 60,
        0,
      );

      const achievement =
        dayHours > 0 ? Math.round((dayHours / dailyGoal) * 100) : 0;

      return {
        day: date.getDate(),
        실제시간: Math.round(dayHours * 10) / 10,
        목표: dailyGoal,
        달성률: achievement,
      };
    });
  }, [phases, selectedDate]);

  const hasData = chartData.some((d) => d.실제시간 > 0);

  if (!hasData) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>🎯 일일 목표 달성률</h3>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          이번 달 활동 데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>
        🎯 일일 목표 달성률 ({format(selectedDate, 'yyyy년 MM월')})
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis
            dataKey='day'
            className='text-xs'
            label={{ value: '일', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            yAxisId='left'
            className='text-xs'
            label={{ value: '시간', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId='right'
            orientation='right'
            className='text-xs'
            label={{ value: '달성률(%)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar
            yAxisId='left'
            dataKey='실제시간'
            fill='#22c55e'
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId='left'
            type='monotone'
            dataKey='목표'
            stroke='#ef4444'
            strokeWidth={2}
            strokeDasharray='5 5'
            dot={false}
          />
          <Line
            yAxisId='right'
            type='monotone'
            dataKey='달성률'
            stroke='#f59e0b'
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
