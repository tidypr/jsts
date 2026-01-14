'use server';

import { auth } from '@/auth';
import { prisma } from '@/shared/lib/prisma/prisma';
import { revalidatePath } from 'next/cache';

/**
 * 사후 기록 생성 (Todo 방식)
 * @param data - templateId, endTime
 */
export async function createPostPhase(data: {
  templateId: string;
  endTime: Date;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      };
    }

    // 템플릿 정보 가져오기
    const template = await prisma.activityTemplate.findFirst({
      where: {
        id: data.templateId,
        userId: session.user.id,
      },
    });

    if (!template) {
      return {
        success: false,
        error: '템플릿을 찾을 수 없습니다',
      };
    }

    // endTime에서 defaultTime만큼 빼서 startTime 계산
    const endTime = new Date(data.endTime);
    const startTime = new Date(endTime.getTime() - template.defaultTime * 1000);

    // Phase 생성
    const phase = await prisma.phase.create({
      data: {
        userId: session.user.id,
        activityTemplateId: template.id,
        color: template.color,
        emoji: template.emoji,
        title: template.title,
        note: template.note || '',
        startTime,
        endTime,
        status: 'COMPLETED',
        isAutomatic: false,
      },
    });

    // Segment 생성
    await prisma.segment.create({
      data: {
        phaseId: phase.id,
        startTime,
        endTime,
      },
    });

    revalidatePath('/record');
    revalidatePath('/home');

    return {
      success: true,
      data: phase,
    };
  } catch (error) {
    console.error('사후 기록 생성 실패:', error);
    return {
      success: false,
      error: '사후 기록을 생성하는데 실패했습니다',
    };
  }
}

/**
 * 특정 시간대에 사후 기록 생성
 * @param data - templateId, startTime, endTime
 */
export async function createPostPhaseWithTime(data: {
  templateId: string;
  startTime: Date;
  endTime: Date;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      };
    }

    // 템플릿 정보 가져오기
    const template = await prisma.activityTemplate.findFirst({
      where: {
        id: data.templateId,
        userId: session.user.id,
      },
    });

    if (!template) {
      return {
        success: false,
        error: '템플릿을 찾을 수 없습니다',
      };
    }

    // Phase 생성
    const phase = await prisma.phase.create({
      data: {
        userId: session.user.id,
        activityTemplateId: template.id,
        color: template.color,
        emoji: template.emoji,
        title: template.title,
        note: template.note || '',
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'COMPLETED',
        isAutomatic: false,
      },
    });

    // Segment 생성
    await prisma.segment.create({
      data: {
        phaseId: phase.id,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    revalidatePath('/record');
    revalidatePath('/home');

    return {
      success: true,
      data: phase,
    };
  } catch (error) {
    console.error('사후 기록 생성 실패:', error);
    return {
      success: false,
      error: '사후 기록을 생성하는데 실패했습니다',
    };
  }
}
