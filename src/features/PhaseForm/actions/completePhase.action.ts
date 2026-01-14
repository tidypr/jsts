'use server';

import { prisma } from '@/shared/lib/prisma/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

const completePhaseInputSchema = z.object({
  phaseId: z.string(),
  note: z.string().optional(),
});

type CompletePhaseInput = z.infer<typeof completePhaseInputSchema>;

export async function completePhaseAction(
  rawData: CompletePhaseInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const validData = completePhaseInputSchema.parse(rawData);

    // Verify phase exists and get segments
    const phaseExists = await prisma.phase.findUnique({
      where: { id: validData.phaseId },
      include: { segments: true },
    });

    if (!phaseExists) {
      console.error('Phase not found:', validData.phaseId);
      return {
        success: false,
        error: 'Phase를 찾을 수 없습니다.',
      };
    }

    const now = new Date();

    // Close any active segment
    const activeSegment = phaseExists.segments.find((s) => s.endTime === null);
    if (activeSegment) {
      await prisma.segment.update({
        where: { id: activeSegment.id },
        data: { endTime: now },
      });
    }

    // Get all segments with updated endTime
    const allSegments = await prisma.segment.findMany({
      where: { phaseId: validData.phaseId },
    });

    // Calculate total activity time in minutes (discard seconds)
    let totalMinutes = 0;
    for (const segment of allSegments) {
      if (segment.endTime) {
        const durationMs = segment.endTime.getTime() - segment.startTime.getTime();
        const minutes = Math.floor(durationMs / (1000 * 60)); // Convert to minutes and floor
        totalMinutes += minutes;
      }
    }

    // Award points equal to total minutes
    if (totalMinutes > 0) {
      // Create Point record
      await prisma.point.create({
        data: {
          userId: phaseExists.userId,
          amount: totalMinutes,
          type: 'PHASE_COMPLETE',
          description: `${phaseExists.title || '활동'} 완료 (${totalMinutes}분)`,
        },
      });
    }

    // Update Phase with COMPLETED status and endTime
    const updatedPhase = await prisma.phase.update({
      where: { id: validData.phaseId },
      data: {
        status: 'COMPLETED',
        endTime: now,
        note: validData.note || phaseExists.note,
        updatedAt: now,
      },
    });

    revalidatePath('/timer');
    revalidatePath('/stats');
    revalidatePath('/home');

    return { success: true, data: { id: updatedPhase.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('Phase 완료 처리 실패:', error);
    return {
      success: false as const,
      error: 'Phase 완료 처리 중 오류가 발생했습니다.',
    };
  }
}
