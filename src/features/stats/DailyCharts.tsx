'use client';

import React, { useMemo } from 'react';
import {
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
} from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { calculatePhaseDuration } from './utils';
import type { PhaseData } from './types';
import { startOfDay, subDays, format } from 'date-fns';

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

interface DailyChartsProps {
  phases: PhaseData[];
}

/**
 * 최근 7일 누적 시간 그래프 (Area Chart)
 */
export function DailyCumulativeChart({ phases }: DailyChartsProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return startOfDay(date);
    });

    let cumulativeMinutes = 0;

    return last7Days.map((date) => {
      const dateStr = date.toISOString().split('T')[0];

      // 해당 날짜의 Phase만 필터링
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

      cumulativeMinutes += dayMinutes;

      return {
        date: format(date, 'MM/dd'),
        일간: Math.round((dayMinutes / 60) * 10) / 10,
        누적: Math.round((cumulativeMinutes / 60) * 10) / 10,
      };
    });
  }, [phases]);

  const hasData = chartData.some((d) => d.일간 > 0);

  if (!hasData) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>📈 7일 누적 학습 시간</h3>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          최근 7일간 활동 데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>📈 7일 누적 학습 시간</h3>
      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id='colorDaily' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#22c55e' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#22c55e' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorCumulative' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis dataKey='date' className='text-xs' />
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
            fillOpacity={1}
            fill='url(#colorDaily)'
          />
          <Area
            type='monotone'
            dataKey='누적'
            stroke='#3b82f6'
            fillOpacity={1}
            fill='url(#colorCumulative)'
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

/**
 * 카테고리별 일간 활동 비교 (Stacked Bar Chart)
 */
export function DailyCategoryBarChart({ phases }: DailyChartsProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return startOfDay(date);
    });

    return last7Days.map((date) => {
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

      return {
        date: format(date, 'MM/dd'),
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
      return key !== 'date' && typeof value === 'number' && value > 0;
    }),
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    chartData.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (key !== 'date') cats.add(key);
      });
    });
    return Array.from(cats);
  }, [chartData]);

  if (!hasData) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>📊 카테고리별 일간 활동</h3>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          최근 7일간 활동 데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>📊 카테고리별 일간 활동</h3>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis dataKey='date' className='text-xs' />
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
 * 시간대별 활동 패턴 (오늘 기준)
 */
export function DailyHourlyPattern({ phases }: DailyChartsProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const todayPhases = phases.filter((phase) => {
      if (!phase.startTime || phase.status !== 'COMPLETED') return false;
      const phaseDate = new Date(phase.startTime);
      const phaseDateStr = phaseDate.toISOString().split('T')[0];
      return phaseDateStr === todayStr;
    });

    // 0-23시까지의 데이터 초기화
    const hourlyData: Record<number, Record<string, number>> = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = {};
    }

    todayPhases.forEach((phase) => {
      if (!phase.segments) return;

      phase.segments.forEach((segment) => {
        const startHour = new Date(segment.startTime).getHours();
        const category = phase.title || '기타';

        if (!hourlyData[startHour][category]) {
          hourlyData[startHour][category] = 0;
        }

        const duration = segment.endTime
          ? (new Date(segment.endTime).getTime() -
              new Date(segment.startTime).getTime()) /
            (1000 * 60)
          : 0;

        hourlyData[startHour][category] += duration;
      });
    });

    return Array.from({ length: 24 }, (_, hour) => {
      const data: Record<string, number | string> = { hour: `${hour}시` };
      Object.entries(hourlyData[hour]).forEach(([category, minutes]) => {
        data[category] = Math.round((minutes / 60) * 10) / 10;
      });
      return data;
    });
  }, [phases]);

  const hasData = chartData.some((d) =>
    Object.keys(d).some((key) => {
      const value = (d as Record<string, number | string>)[key];
      return key !== 'hour' && typeof value === 'number' && value > 0;
    }),
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    chartData.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (key !== 'hour') cats.add(key);
      });
    });
    return Array.from(cats);
  }, [chartData]);

  if (!hasData) {
    return (
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>⏰ 시간대별 활동 패턴</h3>
        <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
          오늘 활동 데이터가 없습니다
        </div>
      </Card>
    );
  }

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>
        ⏰ 시간대별 활동 패턴 (오늘)
      </h3>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis
            dataKey='hour'
            className='text-xs'
            angle={-45}
            textAnchor='end'
            height={70}
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
