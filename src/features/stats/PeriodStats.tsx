'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PhaseData } from './types';

interface PeriodStatsProps {
  phases: PhaseData[];
  period: 'daily' | 'weekly' | 'monthly';
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

// 카테고리 색상 매핑
const CATEGORY_COLORS: Record<string, string> = {
  '#22c55e': '#22c55e', // 업무 - 녹색
  '#3b82f6': '#3b82f6', // 공부 - 파랑
  '#a855f7': '#a855f7', // 운동 - 보라
  '#eab308': '#eab308', // 취미 - 노랑
  '#ec4899': '#ec4899', // 사교 - 핑크
  '#6366f1': '#6366f1', // 휴식 - 인디고
  '#f97316': '#f97316', // 가족 - 주황
  '#6b7280': '#6b7280', // 기타 - 회색
};

const CATEGORY_LABELS: Record<string, string> = {
  '#22c55e': '💼 업무',
  '#3b82f6': '📚 공부',
  '#a855f7': '💪 운동',
  '#eab308': '🎨 취미',
  '#ec4899': '👥 사교',
  '#6366f1': '😴 휴식',
  '#f97316': '👨‍👩‍👧 가족',
  '#6b7280': '🔖 기타',
};

export function PeriodStats({
  phases,
  period,
  selectedDate,
  onDateChange,
}: PeriodStatsProps) {
  // 날짜 범위 계산
  const getDateRange = () => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (period === 'daily') {
      // 24시간
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
      // 월요일 시작 7일
      const day = start.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
      // 오늘부터 29일 전 (총 30일)
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  // 날짜 변경 핸들러
  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (period === 'daily') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (period === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (period === 'monthly') {
      newDate.setDate(newDate.getDate() - 30);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (period === 'daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (period === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (period === 'monthly') {
      newDate.setDate(newDate.getDate() + 30);
    }
    onDateChange(newDate);
  };

  // 날짜 범위 텍스트
  const getDateRangeText = () => {
    const { start, end } = getDateRange();

    if (period === 'daily') {
      return start.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });
    } else if (period === 'weekly') {
      const startStr = start.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
      });
      const endStr = end.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
      });
      return `${startStr} - ${endStr}`;
    } else if (period === 'monthly') {
      const startStr = start.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
      });
      const endStr = end.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
      });
      return `${startStr} - ${endStr}`;
    }
  };

  // 기간 내 Phase 필터링
  const { start, end } = getDateRange();
  const filteredPhases = phases.filter((phase) => {
    if (!phase.startTime) return false;
    const phaseDate = new Date(phase.startTime);
    return phaseDate >= start && phaseDate <= end;
  });

  // 차트 데이터 생성
  const generateChartData = () => {
    if (period === 'daily') {
      // 일간: 24시간 (1시간씩)
      const data = Array.from({ length: 24 }, (_, hour) => {
        const hourStart = new Date(start);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(start);
        hourEnd.setHours(hour, 59, 59, 999);

        const hourPhases = filteredPhases.filter((phase) => {
          if (!phase.startTime) return false;
          const phaseDate = new Date(phase.startTime);
          return phaseDate >= hourStart && phaseDate <= hourEnd;
        });

        const totalMinutes = hourPhases.reduce((sum, phase) => {
          if (!phase.segments || phase.segments.length === 0) return sum;
          const phaseTime = phase.segments.reduce((segSum, segment) => {
            if (!segment.endTime) return segSum;
            const duration =
              new Date(segment.endTime).getTime() -
              new Date(segment.startTime).getTime();
            return segSum + duration / 1000 / 60;
          }, 0);
          return sum + phaseTime;
        }, 0);

        return {
          label: `${hour}시`,
          value: Math.round((totalMinutes / 60) * 10) / 10, // 시간 단위
        };
      });
      return data;
    } else if (period === 'weekly') {
      // 주간: 7일 (1일씩)
      const data = Array.from({ length: 7 }, (_, dayIndex) => {
        const dayStart = new Date(start);
        dayStart.setDate(start.getDate() + dayIndex);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const dayPhases = filteredPhases.filter((phase) => {
          if (!phase.startTime) return false;
          const phaseDate = new Date(phase.startTime);
          return phaseDate >= dayStart && phaseDate <= dayEnd;
        });

        const totalMinutes = dayPhases.reduce((sum, phase) => {
          if (!phase.segments || phase.segments.length === 0) return sum;
          const phaseTime = phase.segments.reduce((segSum, segment) => {
            if (!segment.endTime) return segSum;
            const duration =
              new Date(segment.endTime).getTime() -
              new Date(segment.startTime).getTime();
            return segSum + duration / 1000 / 60;
          }, 0);
          return sum + phaseTime;
        }, 0);

        const dayOfWeek = dayStart.toLocaleDateString('ko-KR', {
          weekday: 'short',
        });

        return {
          label: dayOfWeek,
          value: Math.round((totalMinutes / 60) * 10) / 10,
        };
      });
      return data;
    } else {
      // 월간: 30일 (1일씩)
      const data = Array.from({ length: 30 }, (_, dayIndex) => {
        const dayStart = new Date(start);
        dayStart.setDate(start.getDate() + dayIndex);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const dayPhases = filteredPhases.filter((phase) => {
          if (!phase.startTime) return false;
          const phaseDate = new Date(phase.startTime);
          return phaseDate >= dayStart && phaseDate <= dayEnd;
        });

        const totalMinutes = dayPhases.reduce((sum, phase) => {
          if (!phase.segments || phase.segments.length === 0) return sum;
          const phaseTime = phase.segments.reduce((segSum, segment) => {
            if (!segment.endTime) return segSum;
            const duration =
              new Date(segment.endTime).getTime() -
              new Date(segment.startTime).getTime();
            return segSum + duration / 1000 / 60;
          }, 0);
          return sum + phaseTime;
        }, 0);

        return {
          label: `${dayStart.getDate()}일`,
          value: Math.round((totalMinutes / 60) * 10) / 10,
        };
      });
      return data;
    }
  };

  // 카테고리별 통계
  const categoryStats = Object.keys(CATEGORY_COLORS)
    .map((color) => {
      const categoryPhases = filteredPhases.filter((p) => p.title === color);
      const totalMinutes = categoryPhases.reduce((sum, phase) => {
        if (!phase.segments || phase.segments.length === 0) return sum;
        const phaseTime = phase.segments.reduce((segSum, segment) => {
          if (!segment.endTime) return segSum;
          const duration =
            new Date(segment.endTime).getTime() -
            new Date(segment.startTime).getTime();
          return segSum + duration / 1000 / 60;
        }, 0);
        return sum + phaseTime;
      }, 0);

      return {
        category: CATEGORY_LABELS[color],
        color,
        hours: Math.round((totalMinutes / 60) * 10) / 10,
      };
    })
    .filter((stat) => stat.hours > 0);

  categoryStats.sort((a, b) => b.hours - a.hours);

  const chartData = generateChartData();
  const totalHours = chartData.reduce((sum, data) => sum + data.value, 0);

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      {/* <Card className='p-4'> */}
      <div className='mb-2 w-full max-w-lg'>
        <div className='flex w-full items-center justify-between'>
          {/* <h3 className='text-lg font-semibold'>
            {period === 'daily' && '일간 통계'}
            {period === 'weekly' && '주간 통계'}
            {period === 'monthly' && '월간 통계'}
          </h3> */}
          <div className='flex w-full items-center gap-2'>
            <Button variant='outline' size='icon' onClick={handlePrevious}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <div className='w-full min-w-[200px] text-center text-sm font-medium'>
              {getDateRangeText()}
            </div>
            <Button variant='outline' size='icon' onClick={handleNext}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
      {/* </Card> */}

      {/* 총 시간 */}
      <Card>
        <CardHeader>
          <CardTitle>총 활동 시간</CardTitle>
          <CardDescription>
            {period === 'daily' && '하루 동안의'}
            {period === 'weekly' && '일주일 동안의'}
            {period === 'monthly' && '한 달 동안의'} 총 시간
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{totalHours.toFixed(1)}시간</div>
        </CardContent>
      </Card>

      {/* 시간대별/일별 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {period === 'daily' && '시간대별 활동'}
            {period === 'weekly' && '요일별 활동'}
            {period === 'monthly' && '일별 활동'}
          </CardTitle>
          <CardDescription>
            {period === 'daily' && '24시간 동안의 활동 분포'}
            {period === 'weekly' && '7일 동안의 활동 분포'}
            {period === 'monthly' && '30일 동안의 활동 분포'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='label'
                tick={{ fontSize: 10 }}
                interval={period === 'monthly' ? 2 : 0}
                angle={period === 'monthly' ? -45 : 0}
                textAnchor={period === 'monthly' ? 'end' : 'middle'}
                height={period === 'monthly' ? 60 : 30}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => `${value || 0}시간`}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey='value' fill='#3b82f6' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 카테고리별 통계 */}
      {categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 활동</CardTitle>
            <CardDescription>활동 유형별 시간 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={200}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='category'
                  tick={{ fontSize: 10 }}
                  angle={-15}
                  textAnchor='end'
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `${value || 0}시간`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey='hours' radius={[4, 4, 0, 0]}>
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className='mt-6 space-y-3'>
              {categoryStats.map((stat) => {
                const percentage =
                  totalHours > 0 ? (stat.hours / totalHours) * 100 : 0;

                return (
                  <div key={stat.category}>
                    <div className='mb-1 flex justify-between text-sm'>
                      <span>{stat.category}</span>
                      <span className='text-muted-foreground'>
                        {stat.hours}h ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className='h-2 overflow-hidden rounded-full bg-secondary'>
                      <div
                        className='h-full rounded-full transition-all'
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: stat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
