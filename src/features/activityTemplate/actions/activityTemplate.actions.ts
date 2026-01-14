'use server';

import { auth } from '@/auth';
import { prisma } from '@/shared/lib/prisma/prisma';
import { activityTemplateSchema, ActivityTemplateInput } from '../activityTemplate.schema';
import { z } from 'zod';

/**
 * 활동 템플릿 조회
 */
export async function getActivityTemplates(userId: string, timerOnly: boolean = false) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.id !== userId) {
      return {
        success: false,
        error: '권한이 없습니다',
      };
    }

    const templates = await prisma.activityTemplate.findMany({
      where: {
        userId,
        ...(timerOnly && { useInTimer: true }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: templates,
    };
  } catch (error) {
    console.error('활동 템플릿 조회 실패:', error);
    return {
      success: false,
      error: '활동 템플릿을 불러오는데 실패했습니다.',
    };
  }
}

/**
 * 활동 템플릿 생성
 */
export async function createActivityTemplate(
  userId: string,
  data: ActivityTemplateInput,
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.id !== userId) {
      return {
        success: false,
        error: '권한이 없습니다',
      };
    }

    const validated = activityTemplateSchema.parse(data);

    const template = await prisma.activityTemplate.create({
      data: {
        ...validated,
        userId,
      },
    });

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error('활동 템플릿 생성 실패:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }
    return {
      success: false,
      error: '활동 템플릿을 생성하는데 실패했습니다.',
    };
  }
}

/**
 * 활동 템플릿 수정
 */
export async function updateActivityTemplate(
  templateId: string,
  userId: string,
  data: Partial<ActivityTemplateInput>,
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.id !== userId) {
      return {
        success: false,
        error: '권한이 없습니다',
      };
    }

    // 본인의 템플릿인지 확인
    const template = await prisma.activityTemplate.findFirst({
      where: { id: templateId, userId },
    });

    if (!template) {
      return {
        success: false,
        error: '활동 템플릿을 찾을 수 없습니다.',
      };
    }

    const updated = await prisma.activityTemplate.update({
      where: { id: templateId },
      data,
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('활동 템플릿 수정 실패:', error);
    return {
      success: false,
      error: '활동 템플릿을 수정하는데 실패했습니다.',
    };
  }
}

/**
 * 활동 템플릿 삭제
 */
export async function deleteActivityTemplate(
  templateId: string,
  userId: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.id !== userId) {
      return {
        success: false,
        error: '권한이 없습니다',
      };
    }

    // 본인의 템플릿인지 확인
    const template = await prisma.activityTemplate.findFirst({
      where: { id: templateId, userId },
    });

    if (!template) {
      return {
        success: false,
        error: '활동 템플릿을 찾을 수 없습니다.',
      };
    }

    await prisma.activityTemplate.delete({
      where: { id: templateId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('활동 템플릿 삭제 실패:', error);
    return {
      success: false,
      error: '활동 템플릿을 삭제하는데 실패했습니다.',
    };
  }
}
