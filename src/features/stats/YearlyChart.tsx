'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/shared/components/ui/card';
import {
  calculateYearlyStats,
  formatDuration,
  minutesToHours,
  type YearlyStats,
} from './yearlyUtils';
import { CATEGORY_LABELS } from './utils';
import type { PhaseData } from './types';

// 차트용 기본 색상 배열
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

interface YearlyChartProps {
  phases: PhaseData[];
  year?: number;
}

/**
 * 커스텀 툴팁
 */
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className='rounded-lg border bg-background p-3 shadow-lg'>
      <p className='mb-2 font-semibold'>{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className='flex items-center gap-2'>
          <div
            className='h-3 w-3 rounded-full'
            style={{ backgroundColor: entry.color }}
          />
          <span className='text-sm text-muted-foreground'>
            {entry.name}:{' '}
            {typeof entry.value === 'number'
              ? minutesToHours(entry.value).toFixed(1)
              : entry.value}
            시간
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * 연간 통계 요약 카드
 */
const StatsCard = ({ stats }: { stats: YearlyStats }) => {
  return (
    <div className='mb-6 grid grid-cols-2 gap-4'>
      <Card className='p-4'>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>총 학습 시간</p>
          <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
            {stats.totalHours.toFixed(0)}시간
          </p>
          <p className='text-xs text-muted-foreground'>
            {formatDuration(stats.totalMinutes)}
          </p>
        </div>
      </Card>

      <Card className='p-4'>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>일평균 학습</p>
          <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
            {minutesToHours(stats.averageMinutesPerDay).toFixed(1)}시간
          </p>
          <p className='text-xs text-muted-foreground'>
            {formatDuration(stats.averageMinutesPerDay)}
          </p>
        </div>
      </Card>

      <Card className='p-4'>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>총 활동 수</p>
          <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
            {stats.totalPhases}개
          </p>
          <p className='text-xs text-muted-foreground'>
            {stats.totalSegments}개 세션
          </p>
        </div>
      </Card>

      <Card className='p-4'>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>최고의 달</p>
          <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
            {stats.mostProductiveMonth}
          </p>
          <p className='text-xs text-muted-foreground'>
            {CATEGORY_LABELS[stats.mostUsedCategory] || stats.mostUsedCategory}
          </p>
        </div>
      </Card>
    </div>
  );
};

/**
 * 월별 학습 시간 Area Chart
 */
const MonthlyAreaChart = ({ stats }: { stats: YearlyStats }) => {
  return (
    <Card className='mb-6 p-6'>
      <h3 className='mb-4 text-lg font-semibold'>월별 학습 시간 추이</h3>
      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={stats.monthlyData}>
          <defs>
            <linearGradient id='colorHours' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis
            dataKey='monthName'
            className='text-xs text-muted-foreground'
          />
          <YAxis
            className='text-xs text-muted-foreground'
            label={{ value: '시간', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type='monotone'
            dataKey='totalMinutes'
            stroke='#3b82f6'
            fillOpacity={1}
            fill='url(#colorHours)'
            name='학습 시간'
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

/**
 * 월별 활동 수 Bar Chart
 */
const MonthlyBarChart = ({ stats }: { stats: YearlyStats }) => {
  return (
    <Card className='mb-6 p-6'>
      <h3 className='mb-4 text-lg font-semibold'>월별 활동 수</h3>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={stats.monthlyData}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis
            dataKey='monthName'
            className='text-xs text-muted-foreground'
          />
          <YAxis
            className='text-xs text-muted-foreground'
            label={{ value: '활동 수', angle: -90, position: 'insideLeft' }}
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
            dataKey='phaseCount'
            fill='#8b5cf6'
            name='활동'
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey='segmentCount'
            fill='#10b981'
            name='세션'
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

/**
 * 카테고리별 분포 Pie Chart
 */
const CategoryPieChart = ({ stats }: { stats: YearlyStats }) => {
  const data = stats.categoryData.map((cat) => ({
    name: CATEGORY_LABELS[cat.category] || cat.category,
    value: cat.totalMinutes,
    hours: cat.totalHours,
    percentage: cat.percentage,
  }));

  const CustomPieTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { category: string; hours: number; percentage: number; fill: string } }>;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className='rounded-lg border bg-background p-3 shadow-lg'>
        <p className='mb-1 font-semibold'>{data.category}</p>
        <p className='text-sm text-muted-foreground'>
          {data.hours.toFixed(1)}시간 ({data.percentage}%)
        </p>
      </div>
    );
  };

  return (
    <Card className='mb-6 p-6'>
      <h3 className='mb-4 text-lg font-semibold'>카테고리별 분포</h3>
      <div className='flex flex-col items-center gap-6'>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={({ name, value }) => {
                const total = data.reduce((sum, item) => sum + item.value, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${name} ${percentage}%`;
              }}
              outerRadius={100}
              fill='#8884d8'
              dataKey='value'
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className='w-full space-y-2'>
          {stats.categoryData.map((cat, index) => (
            <div
              key={cat.category}
              className='flex items-center justify-between rounded-lg bg-muted/50 p-3'
            >
              <div className='flex items-center gap-3'>
                <div
                  className='h-4 w-4 rounded-full'
                  style={{
                    backgroundColor:
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                  }}
                />
                <span className='font-medium'>{cat.category}</span>
              </div>
              <div className='text-right'>
                <p className='font-semibold'>{cat.totalHours.toFixed(1)}h</p>
                <p className='text-xs text-muted-foreground'>
                  {cat.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

/**
 * 메인 연간 차트 컴포넌트
 */
export default function YearlyChart({ phases, year }: YearlyChartProps) {
  const currentYear = year || new Date().getFullYear();

  const stats = useMemo(
    () => calculateYearlyStats(phases, currentYear),
    [phases, currentYear],
  );

  if (phases.length === 0) {
    return (
      <Card className='p-8'>
        <div className='text-center text-muted-foreground'>
          <p>아직 {currentYear}년 활동 데이터가 없습니다.</p>
          <p className='mt-2 text-sm'>타이머로 활동을 기록해보세요!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold'>{currentYear}년 연간 통계</h2>
        <p className='mt-2 text-muted-foreground'>
          한 해 동안의 학습 활동을 한눈에 확인하세요
        </p>
      </div>

      <StatsCard stats={stats} />
      <MonthlyAreaChart stats={stats} />
      <MonthlyBarChart stats={stats} />
      <CategoryPieChart stats={stats} />
    </div>
  );
}
