'use server';

import { CreatePostInput, createPostInputSchema } from './feedSchema';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

/**
 * 게시물을 생성하는 Server Action
 * Mock 환경에서는 실제 DB에 저장하지 않고 성공 응답만 반환
 */
export async function createPostAction(
  rawData: CreatePostInput,
): Promise<ActionResult<{ id: number }>> {
  try {
    // Validation - server side
    const validData = createPostInputSchema.parse(rawData);

    // API 호출 시뮬레이션 (500ms 딜레이)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock: 실제로는 DB에 저장하고 생성된 ID를 반환
    // 여기서는 랜덤 ID 생성
    const newPostId = Math.floor(Math.random() * 10000) + 100;

    // Mock: 생성된 게시물 로그
    console.log('새 게시물 생성:', {
      id: newPostId,
      userId: validData.userId,
      title: validData.title,
      category: validData.category,
      tags: validData.tags,
      createdAt: new Date(),
    });

    // 캐시 재검증
    revalidatePath('/social');
    revalidatePath('/home');

    return {
      success: true,
      data: { id: newPostId },
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
