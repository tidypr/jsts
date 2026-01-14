'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/shared/lib/prisma/prisma';
import {
  sharePhaseToFeedSchema,
  SharePhaseToFeedInput,
} from '../sharePhaseToFeed.schema';

// 게시물 내용 템플릿
const CONTENT_TEMPLATES = [
  '오늘 {category} 활동을 {time} 동안 집중해서 완료했습니다!',
  '{category} {time} 동안 몰입했어요!',
  '오늘도 {category}로 {time} 집중 타임 완료!',
  '{time} 동안 {category} 활동에 집중했습니다!',
  '{category} {time} 동안 열심히 했어요!',
  '오늘 {category}에 {time} 투자했습니다!',
  '{category} 활동 {time} 완주했어요!',
  '오늘도 {category}로 {time} 집중 성공!',
  '{time} 동안 {category}에 몰두했습니다!',
  '{category} {time} 집중 완료! 뿌듯해요!',
];

// 마무리 문구 템플릿
const CLOSING_TEMPLATES = [
  '꾸준히 노력하는 중입니다! 💪',
  '한 걸음 한 걸음 성장하고 있어요! 🌱',
  '오늘도 목표를 향해 전진! 🚀',
  '작은 성취가 모여 큰 변화를 만듭니다! ✨',
  '지금 이 순간에 집중하고 있습니다! 🎯',
  '매일 조금씩 발전하는 중! 📈',
  '계속 달려가봅니다! 🏃',
  '하루하루 쌓아가는 성장! 🌟',
  '포기하지 않고 계속 도전! 💫',
  '오늘도 최선을 다했어요! 🔥',
];

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

/**
 * Phase 완료 내용을 Feed에 공유하는 Server Action
 */
export async function sharePhaseToFeedAction(
  rawData: SharePhaseToFeedInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    console.log('📤 Feed 공유 시작 - 입력 데이터:', rawData);

    // Validation
    const validData = sharePhaseToFeedSchema.parse(rawData);
    console.log('✅ Validation 통과:', validData);

    // 시간 포맷팅
    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);

      if (hours > 0) {
        return `${hours}시간 ${mins}분`;
      }
      return `${mins}분`;
    };

    const timeText = formatTime(validData.completedTime);

    // 게시물 제목 생성
    const title = `${validData.category} ${timeText} 완료! 🎉`;

    // 랜덤 템플릿 선택
    const randomContentTemplate =
      CONTENT_TEMPLATES[Math.floor(Math.random() * CONTENT_TEMPLATES.length)];
    const randomClosingTemplate =
      CLOSING_TEMPLATES[Math.floor(Math.random() * CLOSING_TEMPLATES.length)];

    // 게시물 내용 생성
    let content =
      randomContentTemplate
        .replace('{category}', validData.category)
        .replace('{time}', timeText) + '\n\n';

    if (validData.note) {
      content += `💭 ${validData.note}\n\n`;
    }

    content += randomClosingTemplate;

    console.log('📝 생성할 게시물:', { title, content });

    // User 확인
    const userExists = await prisma.user.findUnique({
      where: { id: validData.userId },
    });

    if (!userExists) {
      console.error('❌ User not found:', validData.userId);
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      };
    }

    console.log('✅ User 확인 완료:', userExists.id);

    // Phase 정보 가져오기
    const phase = await prisma.phase.findUnique({
      where: { id: validData.phaseId },
    });

    if (!phase) {
      console.error('❌ Phase not found:', validData.phaseId);
      return {
        success: false,
        error: 'Phase를 찾을 수 없습니다.',
      };
    }

    console.log('✅ Phase 확인 완료:', phase.id);

    // DB에 게시물 저장
    const newPost = await prisma.post.create({
      data: {
        userId: validData.userId,
        title,
        content,
        phaseId: validData.phaseId,
      },
    });

    console.log('✅ Post 생성 완료:', newPost.id);

    // 태그 생성 및 연결
    const tagNames = ['#집중완료', `#${validData.category}`, '#StudyChallenge'];
    for (const tagName of tagNames) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        create: { name: tagName },
        update: {},
      });

      await prisma.postTag.create({
        data: {
          postId: newPost.id,
          tagId: tag.id,
        },
      });
    }

    console.log('✅ Post 생성 완료:', newPost.id);

    // 캐시 재검증
    revalidatePath('/social');
    revalidatePath('/home');
    revalidatePath('/feed');

    return {
      success: true,
      data: { id: newPost.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Feed 공유 - Validation 오류:', error.issues);
      return {
        success: false,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('Feed 공유 실패 - 상세:', error);
    console.error('Error name:', (error as Error).name);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Feed에 공유하는 중 오류가 발생했습니다: ${errorMessage}`,
    };
  }
}
