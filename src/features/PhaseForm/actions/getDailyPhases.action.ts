'use server';

import { auth } from '@/auth';
import { prisma } from '@/shared/lib/prisma/prisma';

/**
 * 특정 날짜의 Phase 기록 조회
 */
export async function getDailyPhases(userId: string, date: Date) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.id !== userId) {
      return {
        success: false,
        error: '권한이 없습니다',
      };
    }

    // 해당 날짜의 시작과 끝
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Phase 조회
    const phases = await prisma.phase.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        endTime: {
          not: null,
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        segments: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return {
      success: true,
      data: phases,
    };
  } catch (error) {
    console.error('일별 Phase 조회 실패:', error);
    return {
      success: false,
      error: '일별 기록을 불러오는데 실패했습니다',
    };
  }
}
