'use server';

import { prisma } from '@/shared/lib/prisma/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

const updatePhaseStatusInputSchema = z.object({
  phaseId: z.string(),
  status: z.enum(['STARTED', 'PAUSED', 'COMPLETED']),
});

type UpdatePhaseStatusInput = z.infer<typeof updatePhaseStatusInputSchema>;

export async function updatePhaseStatusAction(
  rawData: UpdatePhaseStatusInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const validData = updatePhaseStatusInputSchema.parse(rawData);

    console.log('updatePhaseStatusAction - validData:', validData);

    // Verify phase exists and get current segments
    const phaseExists = await prisma.phase.findUnique({
      where: { id: validData.phaseId },
      include: { segments: { orderBy: { startTime: 'desc' } } },
    });

    if (!phaseExists) {
      console.error('Phase not found:', validData.phaseId);
      return {
        success: false,
        error: 'Phase를 찾을 수 없습니다.',
      };
    }

    const now = new Date();

    // Handle segment lifecycle based on status transition
    if (validData.status === 'PAUSED') {
      // When pausing, close the current active segment
      const activeSegment = phaseExists.segments.find(
        (s) => s.endTime === null,
      );
      if (activeSegment) {
        await prisma.segment.update({
          where: { id: activeSegment.id },
          data: { endTime: now },
        });
      }
    } else if (
      validData.status === 'STARTED' &&
      phaseExists.status === 'PAUSED'
    ) {
      // When resuming from PAUSED, create a new segment
      await prisma.segment.create({
        data: {
          phaseId: validData.phaseId,
          startTime: now,
          // endTime is null for ongoing segment
        },
      });
    }

    // Update Phase status
    const updatedPhase = await prisma.phase.update({
      where: { id: validData.phaseId },
      data: {
        status: validData.status,
        updatedAt: now,
      },
    });

    console.log('updatePhaseStatusAction - updated:', updatedPhase);

    revalidatePath('/timer');
    revalidatePath('/stats');
    revalidatePath('/home');

    return { success: true, data: { id: updatedPhase.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return {
        success: false as const,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('Phase 상태 업데이트 실패:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false as const,
      error: `Phase 상태 업데이트 중 오류가 발생했습니다: ${errorMessage}`,
    };
  }
}
