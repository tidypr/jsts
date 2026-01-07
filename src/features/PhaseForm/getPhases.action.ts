'use server';

import { prisma } from '@/shared/lib/prisma/prisma';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface Phase {
  id: string;
  category: string;
  date: Date;
  note: string | null;
  isAutomatic: boolean;
  createdAt: Date;
  updatedAt: Date;
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
