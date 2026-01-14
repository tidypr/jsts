'use server';

import { prisma } from '@/shared/lib/prisma/prisma';
import type { PhaseData } from './types';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * 사용자의 모든 Phase 데이터를 조회합니다.
 * 통계 계산을 위해 완료된(COMPLETED) Phase만 조회할 수도 있습니다.
 */
export async function getUserPhasesAction(
  userId: string,
  onlyCompleted: boolean = false,
): Promise<ActionResult<PhaseData[]>> {
  try {
    const phases = await prisma.phase.findMany({
      where: {
        userId,
        ...(onlyCompleted && { status: 'COMPLETED' }),
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        segments: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    return { success: true, data: phases };
  } catch (error) {
    console.error('Phase 조회 실패:', error);
    return {
      success: false,
      error: 'Phase 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 특정 기간의 Phase 데이터를 조회합니다.
 */
export async function getUserPhasesByDateRangeAction(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<ActionResult<PhaseData[]>> {
  try {
    const phases = await prisma.phase.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        segments: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    return { success: true, data: phases };
  } catch (error) {
    console.error('Phase 조회 실패:', error);
    return {
      success: false,
      error: 'Phase 조회 중 오류가 발생했습니다.',
    };
  }
}
