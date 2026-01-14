'use server';

import { CreatePostInput, createPostInputSchema } from '../feedSchema';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/shared/lib/prisma/prisma';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

/**
 * 게시물을 생성하는 Server Action
 */
export async function createPostAction(
  rawData: CreatePostInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validation - server side
    const validData = createPostInputSchema.parse(rawData);

    // DB에 게시물 저장
    const newPost = await prisma.post.create({
      data: {
        userId: validData.userId,
        title: validData.title,
        content: validData.content,
        image: validData.image,
        phaseId: validData.phaseId,
      },
    });

    // 태그 생성 및 연결
    if (validData.tags && validData.tags.length > 0) {
      for (const tagName of validData.tags) {
        // 태그가 존재하지 않으면 생성
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          create: { name: tagName },
          update: {},
        });

        // PostTag 연결
        await prisma.postTag.create({
          data: {
            postId: newPost.id,
            tagId: tag.id,
          },
        });
      }
    }

    // 캐시 재검증
    revalidatePath('/social');
    revalidatePath('/home');

    return {
      success: true,
      data: { id: newPost.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('게시물 생성 실패:', error);
    return {
      success: false,
      error: '게시물 생성 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 게시물 좋아요 토글 (Mock)
 */
export async function toggleLikeAction(
  postId: number,
  userId: string,
): Promise<ActionResult<{ liked: boolean; newLikeCount: number }>> {
  try {
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Mock: 랜덤으로 좋아요 상태 결정
    const liked = Math.random() > 0.5;
    const newLikeCount = Math.floor(Math.random() * 500) + 1;

    console.log('좋아요 토글:', { postId, userId, liked, newLikeCount });

    revalidatePath('/social');

    return {
      success: true,
      data: { liked, newLikeCount },
    };
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    return {
      success: false,
      error: '좋아요 처리 중 오류가 발생했습니다.',
    };
  }
}
