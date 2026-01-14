'use server';

import { auth } from '@/auth';
import { prisma } from '@/shared/lib/prisma/prisma';
import { PointHistoryListSchema } from './pointHistory.schema';

/**
 * 현재 사용자의 포인트 히스토리를 조회합니다
 * @returns 포인트 히스토리 목록 (최신순 정렬)
 */
export async function getPointHistory() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    const pointHistory = await prisma.point.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const validatedData = PointHistoryListSchema.parse(pointHistory);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    console.error('Failed to fetch point history:', error);
    return {
      success: false,
      message: '포인트 히스토리를 불러오는데 실패했습니다.',
    };
  }
}
