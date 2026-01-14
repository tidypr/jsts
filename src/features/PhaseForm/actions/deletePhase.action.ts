'use server';

import { prisma } from '@/shared/lib/prisma/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

const deletePhaseInputSchema = z.object({
  phaseId: z.string(),
});

type DeletePhaseInput = z.infer<typeof deletePhaseInputSchema>;

export async function deletePhaseAction(
  rawData: DeletePhaseInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const validData = deletePhaseInputSchema.parse(rawData);

    // Verify phase exists
    const phaseExists = await prisma.phase.findUnique({
      where: { id: validData.phaseId },
    });

    if (!phaseExists) {
      console.error('Phase not found:', validData.phaseId);
      return {
        success: false,
        error: 'Phase를 찾을 수 없습니다.',
      };
    }

    // Delete phase (segments will be deleted automatically due to cascade)
    await prisma.phase.delete({
      where: { id: validData.phaseId },
    });

    console.log('✅ Phase 삭제 완료:', validData.phaseId);

    // Revalidate paths
    revalidatePath('/timer');
    revalidatePath('/stats');
    revalidatePath('/home');

    return {
      success: true,
      data: { id: validData.phaseId },
    };
  } catch (error) {
    console.error('Phase 삭제 실패:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }
    return {
      success: false,
      error: 'Phase 삭제 중 오류가 발생했습니다.',
    };
  }
}
