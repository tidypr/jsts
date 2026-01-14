'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  generateDailySummary,
  generateHourlyActivities,
  generateCategorySummary,
  generateHourlyChartData,
} from './dailyUtils';
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

interface DailyActivityDashboardProps {
  phases: PhaseData[];
}

/**
 * 일간 활동 대시보드 컴포넌트
 * - 30일간의 활동 데이터를 시각화
 */
export default function DailyActivityDashboard({
  phases,
}: DailyActivityDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 데이터 처리
  const dailySummary = useMemo(() => generateDailySummary(phases), [phases]);
  const categorySummary = useMemo(
    () => generateCategorySummary(phases),
    [phases],
  );
  const hourlyActivities = useMemo(
    () => generateHourlyActivities(phases, selectedDate),
    [phases, selectedDate],
  );

  // 시간대별 차트 데이터 (0-23시)
  const hourlyChartData = useMemo(
    () => generateHourlyChartData(hourlyActivities),
    [hourlyActivities],
  );

  // 일별 총 활동 시간 차트 (최근 30일)
  const dailyTrendData = useMemo(() => {
    return dailySummary.map((day) => ({
      date: new Date(day.date).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      }),
      시간: day.totalHours,
    }));
  }, [dailySummary]);

  // 카테고리별 파이 차트 데이터
  const categoryPieData = useMemo(() => {
    return categorySummary.map((cat) => ({
      name: cat.category,
      value: cat.totalHours,
      count: cat.count,
    }));
  }, [categorySummary]);

  // 날짜 선택 핸들러
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  };

  // 선택된 날짜의 총 활동 시간
  const selectedDateSummary = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return dailySummary.find((day) => day.date === dateStr);
  }, [selectedDate, dailySummary]);

  if (phases.length === 0) {
    return (
      <Card className='p-8'>
        <div className='text-center text-muted-foreground'>
          <p>아직 활동 데이터가 없습니다.</p>
          <p className='mt-2 text-sm'>타이머로 활동을 기록해보세요!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className='w-full space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>일간 활동 대시보드</h2>
        <p className='text-muted-foreground'>최근 30일간의 활동을 분석합니다</p>
      </div>

      {/* 전체 통계 카드 */}
      <div className='grid grid-cols-2 gap-4'>
        <Card className='p-4'>
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>총 활동 시간</p>
            <p className='text-2xl font-bold'>
              {Math.round(
                dailySummary.reduce((sum, day) => sum + day.totalHours, 0) * 10,
              ) / 10}
              <span className='ml-1 text-base text-muted-foreground'>시간</span>
            </p>
          </div>
        </Card>

        <Card className='p-4'>
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>총 Phase 수</p>
            <p className='text-2xl font-bold'>
              {dailySummary.reduce((sum, day) => sum + day.phaseCount, 0)}
              <span className='ml-1 text-base text-muted-foreground'>개</span>
            </p>
          </div>
        </Card>
      </div>

      {/* 30일 활동 추이 */}
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>📈 30일 활동 추이</h3>
        <ResponsiveContainer width='100%' height={250}>
          <LineChart data={dailyTrendData}>
            <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
            <XAxis
              dataKey='date'
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor='end'
              height={80}
            />
            <YAxis
              label={{ value: '시간', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='시간'
              stroke='#3b82f6'
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 카테고리별 통계 */}
      <div className='grid grid-cols-1 gap-6'>
        <Card className='p-6'>
          <h3 className='mb-4 text-lg font-semibold'>
            📊 카테고리별 시간 분포
          </h3>
          <ResponsiveContainer width='100%' height={250}>
            <PieChart>
              <Pie
                data={categoryPieData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {categoryPieData.map((entry, index) => {
                  const categoryInfo = categorySummary.find(
                    (cat) => cat.category === entry.name,
                  );
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        categoryInfo?.color ||
                        DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                      }
                    />
                  );
                })}
              </Pie>
              <Tooltip
                formatter={(value: number | undefined) => [
                  `${value?.toFixed(1) ?? 0}시간`,
                  '활동 시간',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className='p-6'>
          <h3 className='mb-4 text-lg font-semibold'>
            📋 카테고리별 상세 통계
          </h3>
          <div className='space-y-3'>
            {categorySummary.map((cat) => (
              <div
                key={cat.category}
                className='flex items-center justify-between'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className='h-4 w-4 rounded'
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className='font-medium'>{cat.category}</span>
                </div>
                <div className='text-right'>
                  <p className='font-bold'>{cat.totalHours}시간</p>
                  <p className='text-sm text-muted-foreground'>{cat.count}회</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 특정 날짜 상세 분석 */}
      <Card className='p-6'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>🕐 일일 시간대별 활동</h3>
            <div className='flex items-center gap-4'>
              <input
                type='date'
                value={selectedDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                className='rounded-lg border px-3 py-2 text-sm'
                max={new Date().toISOString().split('T')[0]}
              />
              {selectedDateSummary && (
                <div className='text-sm'>
                  <span className='text-muted-foreground'>총 </span>
                  <span className='text-lg font-bold'>
                    {selectedDateSummary.totalHours}시간
                  </span>
                </div>
              )}
            </div>
          </div>

          {hourlyChartData.length > 0 ? (
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={hourlyChartData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  className='stroke-border'
                />
                <XAxis dataKey='hour' />
                <YAxis
                  label={{ value: '시간', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                {categorySummary.map((cat) => (
                  <Bar
                    key={cat.category}
                    dataKey={cat.category}
                    fill={cat.color}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
              선택한 날짜에 활동 데이터가 없습니다
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
