'use server';

import { prisma } from '@/shared/lib/prisma/prisma';
import { CreatePhaseInput, createPhaseInputSchema } from '../phaseSchema';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

export async function createPhaseAction(
  rawData: CreatePhaseInput,
): Promise<ActionResult<{ id: string; userId: string }>> {
  try {
    // Validation - server side
    const validData = createPhaseInputSchema.parse(rawData);

    console.log('Creating phase with userId:', validData.userId);

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: validData.userId },
    });

    if (!userExists) {
      console.error('User not found:', validData.userId);
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다. 다시 로그인해주세요.',
      };
    }

    // Create Phase with Segment in a transaction
    const newPhase = await prisma.phase.create({
      data: {
        userId: validData.userId,
        color: validData.category, // Color value stored directly
        startTime: validData.startTime,
        endTime: validData.endTime,
        note: validData.note,
        isAutomatic: false,
        status: 'COMPLETED', // Manual entries are already completed
        segments: {
          create: {
            startTime: validData.startTime,
            endTime: validData.endTime,
          },
        },
      },
    });

    revalidatePath('/timer');
    revalidatePath('/stats');
    revalidatePath('/home');
    revalidatePath('/record');

    return { success: true, data: { id: newPhase.id, userId: validData.userId } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('Phase 생성 실패:', error);
    return {
      success: false as const,
      error: '세션 생성 중 오류가 발생했습니다.',
    };
  }
}
