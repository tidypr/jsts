'use server';

import {
  GetRankInput,
  GetRankResponse,
  getRankInputSchema,
  RankUser,
} from '../rankSchema';
import { z } from 'zod';
import { prisma } from '@/shared/lib/prisma/prisma';
import { auth } from '@/auth';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

/**
 * 기간에 따른 시작 날짜 계산
 */
function getStartDate(
  period: 'daily' | 'weekly' | 'monthly' | 'all',
): Date | null {
  const now = new Date();

  switch (period) {
    case 'daily':
      // 오늘 00:00:00
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'weekly':
      // 이번 주 월요일 00:00:00
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.getFullYear(), now.getMonth(), diff);
    case 'monthly':
      // 이번 달 1일 00:00:00
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'all':
      // 모든 기간
      return null;
    default:
      return null;
  }
}

/**
 * Segment의 총 시간(분) 계산
 */
function calculateSegmentMinutes(
  startTime: Date,
  endTime: Date | null,
): number {
  if (!endTime) {
    // 진행 중인 Segment는 현재 시간까지 계산
    endTime = new Date();
  }
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.floor(diffMs / (1000 * 60)); // 밀리초를 분으로 변환
}

export async function getRankAction(
  rawData: GetRankInput,
): Promise<ActionResult<GetRankResponse>> {
  try {
    // Validation - server side
    const validData = getRankInputSchema.parse(rawData);

    // 현재 사용자 인증 확인
    const session = await auth();
    const currentUserId = session?.user?.id;

    // 기간에 따른 시작 날짜 계산
    const startDate = getStartDate(validData.period);

    // Phase 데이터 조회 (category 및 기간 필터링)
    const whereClause: Record<string, unknown> = {
      status: 'COMPLETED', // 완료된 Phase만 집계
    };

    if (validData.category) {
      whereClause.title = {
        contains: validData.category,
        mode: 'insensitive',
      };
    }

    if (startDate) {
      whereClause.createdAt = {
        gte: startDate,
      };
    }

    const phases = await prisma.phase.findMany({
      where: whereClause,
      include: {
        segments: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // 사용자별 총 학습 시간 계산
    const userTimeMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        userImage: string | null;
        totalMinutes: number;
        category?: string;
      }
    >();

    for (const phase of phases) {
      const userId = phase.userId;

      // Phase의 모든 Segment 시간 합산
      let phaseMinutes = 0;
      for (const segment of phase.segments) {
        phaseMinutes += calculateSegmentMinutes(
          segment.startTime,
          segment.endTime,
        );
      }

      const existing = userTimeMap.get(userId);
      if (existing) {
        existing.totalMinutes += phaseMinutes;
      } else {
        userTimeMap.set(userId, {
          userId,
          userName: phase.user.name || '이름 없음',
          userImage: phase.user.image,
          totalMinutes: phaseMinutes,
          category: phase.title || undefined,
        });
      }
    }

    // Map을 배열로 변환하고 총 시간으로 정렬
    const sortedUsers = Array.from(userTimeMap.values()).sort(
      (a, b) => b.totalMinutes - a.totalMinutes,
    );

    // 순위 부여
    const rankedUsers: RankUser[] = sortedUsers.map((user, index) => ({
      id: user.userId,
      name: user.userName,
      avatar: user.userImage,
      totalMinutes: user.totalMinutes,
      rank: index + 1,
      category: user.category,
    }));

    // limit 적용
    const limitedUsers = rankedUsers.slice(0, validData.limit);

    // 현재 사용자의 순위 찾기
    const myRank = currentUserId
      ? rankedUsers.find((user) => user.id === currentUserId) || null
      : null;

    return {
      success: true,
      data: {
        ranks: limitedUsers,
        myRank,
        period: validData.period,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('순위 조회 실패:', error);
    return {
      success: false as const,
      error: '순위 조회 중 오류가 발생했습니다.',
    };
  }
}
