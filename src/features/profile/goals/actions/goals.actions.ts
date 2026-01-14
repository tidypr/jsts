'use server';

import { auth } from '@/auth';
import { prisma } from '@/shared/lib/prisma/prisma';
import { goalSchema } from '../goals.schema';
import type { Goal } from '../goals.type';

/**
 * 사용자의 모든 목표 조회
 */
export async function getUserGoals() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      };
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        type: 'asc',
      },
    });

    return {
      success: true,
      data: goals as Goal[],
    };
  } catch (error) {
    console.error('Error fetching user goals:', error);
    return {
      success: false,
      error: '목표를 불러오는 중 오류가 발생했습니다',
    };
  }
}

/**
 * 특정 타입의 목표 조회
 */
export async function getGoalByType(type: 'DAILY' | 'WEEKLY' | 'MONTHLY') {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      };
    }

    const goal = await prisma.goal.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type: type,
        },
      },
    });

    return {
      success: true,
      data: goal as Goal | null,
    };
  } catch (error) {
    console.error('Error fetching goal by type:', error);
    return {
      success: false,
      error: '목표를 불러오는 중 오류가 발생했습니다',
    };
  }
}

/**
 * 목표 생성 또는 업데이트 (Upsert)
 */
export async function upsertGoal(data: {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  targetMinutes: number;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      };
    }

    // 데이터 유효성 검증
    const validatedData = goalSchema.parse(data);

    const goal = await prisma.goal.upsert({
      where: {
        userId_type: {
          userId: session.user.id,
          type: validatedData.type,
        },
      },
      update: {
        targetMinutes: validatedData.targetMinutes,
      },
      create: {
        userId: session.user.id,
        type: validatedData.type,
        targetMinutes: validatedData.targetMinutes,
      },
    });

    return {
      success: true,
      data: goal as Goal,
      message: '목표가 성공적으로 저장되었습니다',
    };
  } catch (error) {
    console.error('Error upserting goal:', error);
    return {
      success: false,
      error: '목표를 저장하는 중 오류가 발생했습니다',
    };
  }
}

/**
 * 목표 삭제
 */
export async function deleteGoal(type: 'DAILY' | 'WEEKLY' | 'MONTHLY') {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      };
    }

    await prisma.goal.delete({
      where: {
        userId_type: {
          userId: session.user.id,
          type: type,
        },
      },
    });

    return {
      success: true,
      message: '목표가 성공적으로 삭제되었습니다',
    };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return {
      success: false,
      error: '목표를 삭제하는 중 오류가 발생했습니다',
    };
  }
}

type GoalProgressResult =
  | {
      success: true;
      data: {
        daily: {
          goal: Goal | undefined;
          currentMinutes: number;
          progress: number;
        };
        weekly: {
          goal: Goal | undefined;
          currentMinutes: number;
          progress: number;
        };
        monthly: {
          goal: Goal | undefined;
          currentMinutes: number;
          progress: number;
        };
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * 목표 진행률 조회
 */
export async function getGoalProgress(): Promise<GoalProgressResult> {
  try {
    const session = await auth();
    
    console.log('[getGoalProgress] Session:', session?.user?.id);

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      };
    }

    // 사용자의 모든 목표 조회
    let goals;
    try {
      goals = await prisma.goal.findMany({
        where: {
          userId: session.user.id,
        },
      });
      console.log('[getGoalProgress] Goals found:', goals.length);
    } catch (err) {
      console.error('[getGoalProgress] Error fetching goals:', err);
      throw new Error(`목표 조회 실패: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 오늘 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 주의 시작일 계산 (월요일)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

    // 월의 시작일 계산
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    console.log('[getGoalProgress] Date ranges calculated');

    // 각 기간별 완료된 Phase의 총 시간 계산
    let phases;
    try {
      phases = await prisma.phase.findMany({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
          endTime: {
            not: null,
          },
        },
        include: {
          segments: true,
        },
      });
      console.log('[getGoalProgress] Phases found:', phases.length);
    } catch (err) {
      console.error('[getGoalProgress] Error fetching phases:', err);
      throw new Error(`Phase 조회 실패: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 각 phase의 총 시간 계산 함수
    const calculatePhaseTime = (phase: typeof phases[0]) => {
      if (!phase.segments || phase.segments.length === 0) return 0;

      return phase.segments.reduce((total, segment) => {
        if (!segment.endTime) return total;
        const start = new Date(segment.startTime).getTime();
        const end = new Date(segment.endTime).getTime();
        return total + (end - start);
      }, 0);
    };

    // 일간 진행률
    const dailyGoal = goals.find((g) => g.type === 'DAILY');
    const dailyPhases = phases.filter((p) => {
      if (!p.endTime) return false;
      const phaseDate = new Date(p.endTime);
      phaseDate.setHours(0, 0, 0, 0);
      return phaseDate.getTime() === today.getTime();
    });
    const dailyMinutes = Math.floor(
      dailyPhases.reduce((total, p) => total + calculatePhaseTime(p), 0) / (1000 * 60)
    );
    const dailyProgress = dailyGoal
      ? Math.min((dailyMinutes / dailyGoal.targetMinutes) * 100, 100)
      : 0;

    // 주간 진행률
    const weeklyGoal = goals.find((g) => g.type === 'WEEKLY');
    const weeklyPhases = phases.filter((p) => {
      if (!p.endTime) return false;
      const phaseDate = new Date(p.endTime);
      phaseDate.setHours(0, 0, 0, 0);
      return phaseDate >= weekStart;
    });
    const weeklyMinutes = Math.floor(
      weeklyPhases.reduce((total, p) => total + calculatePhaseTime(p), 0) / (1000 * 60)
    );
    const weeklyProgress = weeklyGoal
      ? Math.min((weeklyMinutes / weeklyGoal.targetMinutes) * 100, 100)
      : 0;

    // 월간 진행률
    const monthlyGoal = goals.find((g) => g.type === 'MONTHLY');
    const monthlyPhases = phases.filter((p) => {
      if (!p.endTime) return false;
      const phaseDate = new Date(p.endTime);
      phaseDate.setHours(0, 0, 0, 0);
      return phaseDate >= monthStart;
    });
    const monthlyMinutes = Math.floor(
      monthlyPhases.reduce((total, p) => total + calculatePhaseTime(p), 0) / (1000 * 60)
    );
    const monthlyProgress = monthlyGoal
      ? Math.min((monthlyMinutes / monthlyGoal.targetMinutes) * 100, 100)
      : 0;

    const result = {
      success: true as const,
      data: {
        daily: {
          goal: dailyGoal,
          currentMinutes: dailyMinutes,
          progress: dailyProgress,
        },
        weekly: {
          goal: weeklyGoal,
          currentMinutes: weeklyMinutes,
          progress: weeklyProgress,
        },
        monthly: {
          goal: monthlyGoal,
          currentMinutes: monthlyMinutes,
          progress: monthlyProgress,
        },
      },
    };
    
    console.log('[getGoalProgress] Result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('[getGoalProgress] Error:', error);
    console.error('[getGoalProgress] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return {
      success: false,
      error: `목표 진행률을 불러오는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
