'use server';

import { prisma } from '@/shared/lib/prisma/prisma';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface Segment {
  id: string;
  startTime: Date;
  endTime: Date | null;
  phaseId: string;
}

export interface Phase {
  id: string;
  category?: string | null; // deprecated, use color
  color?: string | null;
  emoji?: string | null;
  title?: string | null;
  startTime: Date | null;
  endTime: Date | null;
  note: string | null;
  isAutomatic: boolean;
  createdAt: Date;
  updatedAt: Date;
  segments: Segment[];
}

export async function getRecentPhasesAction(
  userId: string,
  limit: number = 3,
): Promise<ActionResult<Phase[]>> {
  try {
    const phases = await prisma.phase.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
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

export async function getAllPhasesAction(
  userId: string,
): Promise<ActionResult<Phase[]>> {
  try {
    const phases = await prisma.phase.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
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
    console.error('전체 Phase 조회 실패:', error);
    return {
      success: false,
      error: '전체 Phase 조회 중 오류가 발생했습니다.',
    };
  }
}
