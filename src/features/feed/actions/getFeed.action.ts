'use server';

import { Post, FeedFilter, feedFilterSchema } from '../feedSchema';
import { z } from 'zod';
import { prisma } from '@/shared/lib/prisma/prisma';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

/**
 * 피드 데이터를 가져오는 Server Action
 * @param filter - 정렬 및 필터링 옵션
 */
export async function getFeedAction(
  filter: FeedFilter = { sortBy: 'newest', limit: 20, offset: 0 },
): Promise<ActionResult<{ posts: Post[]; total: number }>> {
  try {
    console.log('📥 Feed 조회 시작 - 필터:', filter);

    // Validation
    const validFilter = feedFilterSchema.parse(filter);

    // Where 조건
    const where: Record<string, unknown> = {};

    // 정렬 조건
    const orderBy: Array<Record<string, unknown>> = [];
    switch (validFilter.sortBy) {
      case 'newest':
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'popular':
        orderBy.push({ likes: { _count: 'desc' } });
        break;
      case 'discussed':
        orderBy.push({ comments: { _count: 'desc' } });
        break;
    }

    console.log('🔍 DB 쿼리 조건:', {
      where,
      orderBy,
      limit: validFilter.limit,
    });

    // DB에서 게시물 가져오기
    const [dbPosts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        take: validFilter.limit,
        skip: validFilter.offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    console.log(`✅ DB 조회 완료: ${dbPosts.length}개 게시물, 총 ${total}개`);

    // DB 데이터를 Post 스키마에 맞게 변환
    const posts: Post[] = dbPosts.map((post) => ({
      id: post.id,
      author: {
        name: post.user.name || 'Unknown',
        handle: `@${post.user.email?.split('@')[0] || 'user'}`,
        avatar: post.user.image || undefined,
      },
      title: post.title,
      content: post.content,
      tags: post.tags.map((pt) => pt.tag.name),
      stats: {
        likes: post._count.likes,
        comments: post._count.comments,
        views: post.views,
      },
      image: post.image || undefined,
      createdAt: post.createdAt,
    }));

    // Mock 데이터와 병합 (개발 중에만 사용)
    const allPosts = [...posts];
    console.log(`📦 Mock 데이터 병합: 총 ${allPosts.length}개 게시물`);

    // 다시 정렬
    const sortedPosts = [...allPosts];
    switch (validFilter.sortBy) {
      case 'newest':
        sortedPosts.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        break;
      case 'popular':
        sortedPosts.sort((a, b) => b.stats.likes - a.stats.likes);
        break;
      case 'discussed':
        sortedPosts.sort((a, b) => b.stats.comments - a.stats.comments);
        break;
    }

    return {
      success: true,
      data: {
        posts: sortedPosts,
        total: total,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Feed 조회 - Validation 오류:', error.issues);
      return {
        success: false,
        error: '필터 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('❌ 피드 조회 실패 - 상세:', error);
    console.error('Error name:', (error as Error).name);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `피드를 불러오는 중 오류가 발생했습니다: ${errorMessage}`,
    };
  }
}
