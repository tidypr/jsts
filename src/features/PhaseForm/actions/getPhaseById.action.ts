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
  userId: string;
  category?: string | null; // deprecated, use color
  color?: string | null;
  emoji?: string | null;
  title?: string | null;
  startTime: Date | null;
  endTime: Date | null;
  note: string | null;
  isAutomatic: boolean;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  segments: Segment[];
}

export async function getPhaseByIdAction(
  phaseId: string,
): Promise<ActionResult<Phase>> {
  try {
    const phase = await prisma.phase.findUnique({
      where: {
        id: phaseId,
      },
      include: {
        segments: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    if (!phase) {
      return {
        success: false,
        error: 'Phase를 찾을 수 없습니다.',
      };
    }

    return { success: true, data: phase };
  } catch (error) {
    console.error('Phase 조회 실패:', error);
    return {
      success: false,
      error: 'Phase 조회 중 오류가 발생했습니다.',
    };
  }
}
