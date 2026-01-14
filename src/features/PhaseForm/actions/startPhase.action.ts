'use server';

import { prisma } from '@/shared/lib/prisma/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

const startPhaseInputSchema = z.object({
  userId: z.string(),
  templateId: z.string(),
});

type StartPhaseInput = z.infer<typeof startPhaseInputSchema>;

export async function startPhaseAction(
  rawData: StartPhaseInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const validData = startPhaseInputSchema.parse(rawData);

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

    // Get template information
    const template = await prisma.activityTemplate.findFirst({
      where: {
        id: validData.templateId,
        userId: validData.userId,
      },
    });

    if (!template) {
      console.error('Template not found:', validData.templateId);
      return {
        success: false,
        error: '템플릿을 찾을 수 없습니다.',
      };
    }

    // Create Phase with STARTED status and initial Segment
    const now = new Date();
    const newPhase = await prisma.phase.create({
      data: {
        userId: validData.userId,
        activityTemplateId: template.id,
        color: template.color,
        emoji: template.emoji,
        title: template.title,
        note: template.note || '',
        startTime: now,
        isAutomatic: true,
        status: 'STARTED',
        segments: {
          create: {
            startTime: now,
            // endTime is null for ongoing segment
          },
        },
      },
    });

    console.log('✅ Phase 생성 완료:', newPhase.id);

    revalidatePath('/timer');
    revalidatePath('/stats');
    // '/home'은 revalidate하지 않음 - 카운트다운 상태가 리셋되는 것을 방지

    return { success: true, data: { id: newPhase.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return {
        success: false as const,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('Phase 시작 실패 - 상세:', error);
    console.error('Error name:', (error as Error).name);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false as const,
      error: `Phase 시작 중 오류가 발생했습니다: ${errorMessage}`,
    };
  }
}
