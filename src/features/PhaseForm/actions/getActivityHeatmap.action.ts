'use server';

import { prisma } from '@/shared/lib/prisma/prisma';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface DailyActivity {
  date: string; // YYYY-MM-DD 형식
  count: number;
  duration: number; // 초 단위
}

/**
 * 지정된 기간의 일별 활동 데이터를 가져옵니다.
 * @param userId 사용자 ID
 * @param days 조회할 일수 (기본값: 365일)
 */
export async function getActivityHeatmapAction(
  userId: string,
  days: number = 365,
): Promise<ActionResult<DailyActivity[]>> {
  try {
    // 시작 날짜 계산 (days일 전)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Phase 데이터 조회 (isAutomatic이 true인 것만)
    const phases = await prisma.phase.findMany({
      where: {
        userId,
        isAutomatic: true, // auto로 생성된 phase만 출석으로 인정
        startTime: {
          gte: startDate,
        },
      },
      include: {
        segments: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // 날짜별로 그룹화
    const activityMap = new Map<string, { count: number; duration: number }>();

    phases.forEach((phase) => {
      if (!phase.startTime) return;

      const dateKey = phase.startTime.toISOString().split('T')[0];

      // Calculate total duration from segments
      const duration = phase.segments.reduce((total, segment) => {
        const start = segment.startTime.getTime();
        const end = segment.endTime
          ? segment.endTime.getTime()
          : new Date().getTime();
        return total + Math.floor((end - start) / 1000);
      }, 0);

      if (activityMap.has(dateKey)) {
        const existing = activityMap.get(dateKey)!;
        activityMap.set(dateKey, {
          count: existing.count + 1,
          duration: existing.duration + duration,
        });
      } else {
        activityMap.set(dateKey, { count: 1, duration });
      }
    });

    // Map을 배열로 변환
    const activities: DailyActivity[] = Array.from(activityMap.entries()).map(
      ([date, data]) => ({
        date,
        count: data.count,
        duration: data.duration,
      }),
    );

    return { success: true, data: activities };
  } catch (error) {
    console.error('활동 히트맵 조회 실패:', error);
    return {
      success: false,
      error: '활동 히트맵 조회 중 오류가 발생했습니다.',
    };
  }
}
