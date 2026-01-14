'use server';

import { prisma } from '@/shared/lib/prisma/prisma';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * 사용자의 출석 연속일수를 계산합니다.
 * isAutomatic이 true인 phase만 출석으로 인정합니다.
 */
export async function getAttendanceStreakAction(
  userId: string,
): Promise<ActionResult<number>> {
  try {
    // 최근 365일간의 자동 생성된 phase 조회
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    startDate.setHours(0, 0, 0, 0);

    const phases = await prisma.phase.findMany({
      where: {
        userId,
        isAutomatic: true, // auto로 생성된 phase만
        startTime: {
          gte: startDate,
        },
      },
      select: {
        startTime: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // 날짜별로 그룹화 (하루에 여러 phase가 있을 수 있음)
    const activityDates = new Set<string>();
    phases.forEach((phase) => {
      if (phase.startTime) {
        const dateKey = phase.startTime.toISOString().split('T')[0];
        activityDates.add(dateKey);
      }
    });

    // 날짜를 배열로 변환하고 최신순으로 정렬
    const sortedDates = Array.from(activityDates).sort((a, b) =>
      b.localeCompare(a),
    );

    if (sortedDates.length === 0) {
      return { success: true, data: 0 };
    }

    // 오늘 날짜 (시간 제외)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streakCount = 0;
    const currentDate = new Date(today);

    // 오늘부터 역순으로 연속된 날짜 확인
    for (const dateKey of sortedDates) {
      const activityDate = new Date(dateKey);
      activityDate.setHours(0, 0, 0, 0);
      const currentDateKey = currentDate.toISOString().split('T')[0];

      // 현재 체크하는 날짜와 activity 날짜가 같으면
      if (dateKey === currentDateKey) {
        streakCount++;
        // 다음 날 체크를 위해 하루 이전으로 이동
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (dateKey < currentDateKey) {
        // 날짜가 건너뛰어졌으면 연속 중단
        break;
      }
    }

    return { success: true, data: streakCount };
  } catch (error) {
    console.error('출석 연속일수 계산 실패:', error);
    return {
      success: false,
      error: '출석 연속일수 계산 중 오류가 발생했습니다.',
    };
  }
}
