'use server';

import { prisma } from '@/shared/lib/prisma/prisma';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateBackdatedPhaseInput {
  userId: string;
  category: string;
  color: string;
  title: string;
  durationMinutes: number;
  endTime?: Date; // 지정하지 않으면 현재 시간 사용
}

export interface CreatedPhase {
  id: string;
  category: string;
  startTime: Date;
  endTime: Date;
  note: string;
}

/**
 * Todo 역산 기록 생성
 * endTime으로부터 durationMinutes만큼 역산해서 Phase와 Segment 생성
 *
 * @param input - 역산 기록 생성 입력 데이터
 * @returns 생성된 Phase
 */
export async function createBackdatedPhaseAction(
  input: CreateBackdatedPhaseInput,
): Promise<ActionResult<CreatedPhase>> {
  try {
    const { userId, color, title, durationMinutes, endTime } = input;

    // endTime이 지정되지 않으면 현재 시간 사용
    const phaseEndTime = endTime || new Date();

    // startTime 계산 (역산)
    const phaseStartTime = new Date(phaseEndTime);
    phaseStartTime.setMinutes(phaseStartTime.getMinutes() - durationMinutes);

    // Phase와 Segment를 트랜잭션으로 생성
    const phase = await prisma.phase.create({
      data: {
        userId,
        color: color,
        note: title,
        isAutomatic: false,
        status: 'COMPLETED',
        startTime: phaseStartTime,
        endTime: phaseEndTime,
        segments: {
          create: {
            startTime: phaseStartTime,
            endTime: phaseEndTime,
          },
        },
      },
      include: {
        segments: true,
      },
    });

    return {
      success: true,
      data: {
        id: phase.id,
        category: phase.color || '',
        startTime: phase.startTime!,
        endTime: phase.endTime!,
        note: phase.note,
      },
    };
  } catch (error) {
    console.error('역산 기록 생성 실패:', error);
    return {
      success: false,
      error: '역산 기록 생성 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 특정 시간 범위에 역산 기록 생성
 * 빈 시간대를 채울 때 사용
 */
export async function createBackdatedPhaseInRangeAction(
  input: CreateBackdatedPhaseInput & { startTime: Date },
): Promise<ActionResult<CreatedPhase>> {
  try {
    const { userId, color, title, startTime, endTime } = input;

    if (!endTime) {
      return {
        success: false,
        error: '종료 시간이 필요합니다.',
      };
    }

    // Phase와 Segment를 트랜잭션으로 생성
    const phase = await prisma.phase.create({
      data: {
        userId,
        color: color,
        note: title,
        isAutomatic: false,
        status: 'COMPLETED',
        startTime: startTime,
        endTime: endTime,
        segments: {
          create: {
            startTime: startTime,
            endTime: endTime,
          },
        },
      },
      include: {
        segments: true,
      },
    });

    return {
      success: true,
      data: {
        id: phase.id,
        category: phase.color || '',
        startTime: phase.startTime!,
        endTime: phase.endTime!,
        note: phase.note,
      },
    };
  } catch (error) {
    console.error('범위 지정 역산 기록 생성 실패:', error);
    return {
      success: false,
      error: '역산 기록 생성 중 오류가 발생했습니다.',
    };
  }
}
