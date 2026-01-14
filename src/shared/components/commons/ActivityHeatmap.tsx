'use client';

import { useMemo, useRef, useEffect } from 'react';
import { DailyActivity } from '@/features/PhaseForm/actions/getActivityHeatmap.action';

interface ActivityHeatmapProps {
  activities: DailyActivity[];
  weeks?: number; // 표시할 주 수 (기본값: 26주 = 6개월)
}

export default function ActivityHeatmap({
  activities,
  weeks = 26,
}: ActivityHeatmapProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);

  const { grid, months, maxCount } = useMemo(() => {
    console.log('ActivityHeatmap activities:', activities);

    // 오늘 날짜 설정 (시간 제거)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘이 포함된 주의 토요일 찾기 (주의 마지막 날)
    const endDate = new Date(today);
    const dayOfWeek = endDate.getDay();
    const saturdayOffset = 6 - dayOfWeek; // 토요일까지 남은 날
    endDate.setDate(endDate.getDate() + saturdayOffset);

    // 시작일 계산 (weeks주 전의 일요일)
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);

    console.log('Grid range:', {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0],
    });

    // 활동 데이터를 Map으로 변환
    const activityMap = new Map<string, DailyActivity>();
    activities.forEach((activity) => {
      console.log('Setting activity:', activity.date, activity);
      activityMap.set(activity.date, activity);
    });

    // 최대 count 계산 (색상 레벨을 위해)
    const maxCount = Math.max(...activities.map((a) => a.count), 1);
    console.log('maxCount:', maxCount);

    // 그리드 생성 (주별로 그룹화)
    const grid: (DailyActivity | null)[][] = [];
    const months: Array<{ name: string; startCol: number }> = [];
    let currentMonth = -1;

    for (let week = 0; week < weeks; week++) {
      const weekData: (DailyActivity | null)[] = [];

      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7 + day);

        // 미래 날짜는 제외
        if (date > today) {
          weekData.push(null);
          continue;
        }

        // 로컬 날짜 기준으로 YYYY-MM-DD 형식 생성
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayOfMonth = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${dayOfMonth}`;

        const activity = activityMap.get(dateKey);

        if (activity) {
          console.log('Found activity for date:', dateKey, activity);
        }

        weekData.push(
          activity || {
            date: dateKey,
            count: 0,
            duration: 0,
          },
        );

        // 월 변경 감지 (각 주의 첫 번째 날에만 체크)
        if (day === 0) {
          const month = date.getMonth();
          if (month !== currentMonth) {
            currentMonth = month;
            months.push({
              name: date.toLocaleDateString('ko-KR', { month: 'short' }),
              startCol: week,
            });
          }
        }
      }

      grid.push(weekData);
    }

    return { grid, months, maxCount };
  }, [activities, weeks]);

  // 초기 렌더링 시 스크롤을 끝으로 이동
  useEffect(() => {
    if (scrollContainerRef.current && monthScrollRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollWidth;
      scrollContainerRef.current.scrollLeft = scrollLeft;
      monthScrollRef.current.scrollLeft = scrollLeft;
    }
  }, [grid]);

  // 히트맵 셀 스크롤과 월 레이블 스크롤 동기화
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (monthScrollRef.current) {
      monthScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // 색상 레벨 계산 (0-4)
  const getColorLevel = (count: number): number => {
    if (count === 0) return 0;
    if (maxCount === 1) return 1;
    const percentage = count / maxCount;
    const level =
      percentage < 0.25 ? 1 : percentage < 0.5 ? 2 : percentage < 0.75 ? 3 : 4;
    console.log(
      `getColorLevel - count: ${count}, maxCount: ${maxCount}, percentage: ${percentage.toFixed(2)}, level: ${level}`,
    );
    return level;
  };

  // 색상 클래스 반환
  const getColorClass = (level: number): string => {
    switch (level) {
      case 0:
        return 'bg-muted'; // 활동 없음
      case 1:
        return 'bg-[#0e4429]'; // 낮음
      case 2:
        return 'bg-[#006d32]'; // 보통
      case 3:
        return 'bg-[#26a641]'; // 높음
      case 4:
        return 'bg-[#39d353]'; // 매우 높음
      default:
        return 'bg-[#161b22]';
    }
  };

  // 툴팁 포맷
  const formatTooltip = (activity: DailyActivity | null): string => {
    if (!activity) return '';
    const date = new Date(activity.date);
    const dateStr = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (activity.count === 0) {
      return `${dateStr}\n활동 없음`;
    }

    const hours = Math.floor(activity.duration / 3600);
    const minutes = Math.floor((activity.duration % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;

    return `${dateStr}\n${activity.count}개 세션 • ${timeStr}`;
  };

  return (
    <div className='min-h-full min-w-full space-y-2'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium text-muted-foreground'>활동 기록</h3>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span>낮음</span>
          <div className='flex gap-1'>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-3 w-3 rounded-sm ${getColorClass(level)}`}
              />
            ))}
          </div>
          <span>높음</span>
        </div>
      </div>

      {/* 히트맵 */}
      <div className='py-2'>
        {/* 월 레이블 */}
        <div
          className='scrollbar-hide relative mb-2 ml-9 h-4 overflow-x-auto overflow-y-hidden'
          ref={monthScrollRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div style={{ width: `${grid.length * 14}px` }}>
            {months.map((month, idx) => (
              <div
                key={idx}
                className='absolute text-xs text-muted-foreground'
                style={{ left: `${month.startCol * 14}px` }}
              >
                {month.name}
              </div>
            ))}
          </div>
        </div>

        {/* 그리드 */}
        <div className='flex gap-[3px]'>
          {/* 요일 레이블 (고정) */}
          <div className='flex flex-shrink-0 flex-col gap-[3px] pr-2 text-xs text-muted-foreground'>
            <span className='flex h-[11px] items-center'>월</span>
            <span className='flex h-[11px] items-center'></span>
            <span className='flex h-[11px] items-center'>수</span>
            <span className='flex h-[11px] items-center'></span>
            <span className='flex h-[11px] items-center'>금</span>
            <span className='flex h-[11px] items-center'></span>
            <span className='flex h-[11px] items-center'>일</span>
          </div>

          {/* 히트맵 셀 (스크롤 가능) */}
          <div
            className='overflow-x-auto overflow-y-hidden'
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            <div className='flex gap-[3px]'>
              {grid.map((week, weekIdx) => (
                <div key={weekIdx} className='flex flex-col gap-[3.3px]'>
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={dayIdx}
                          className='h-[11px] w-[11px] rounded-sm bg-transparent'
                        />
                      );
                    }

                    const level = getColorLevel(day.count);
                    const tooltip = formatTooltip(day);

                    return (
                      <div
                        key={dayIdx}
                        className={`h-[11px] w-[11px] rounded-sm transition-all hover:ring-2 hover:ring-[#22c55e] hover:ring-offset-1 hover:ring-offset-background ${getColorClass(level)}`}
                        title={tooltip}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className='flex items-center justify-between pt-2 text-xs text-muted-foreground'>
        <span>
          최근 {weeks}주 동안{' '}
          <span className='font-medium text-foreground'>
            {activities.reduce((sum, a) => sum + a.count, 0)}개
          </span>{' '}
          세션 완료
        </span>
        <span>
          총{' '}
          <span className='font-medium text-foreground'>
            {(() => {
              const totalSeconds = activities.reduce(
                (sum, a) => sum + a.duration,
                0,
              );
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
            })()}
          </span>
        </span>
      </div>
    </div>
  );
}
