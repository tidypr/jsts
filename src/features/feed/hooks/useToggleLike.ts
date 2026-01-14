'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLikeAction } from '../actions/createPost.action';

interface ToggleLikeInput {
  postId: number;
  userId: string;
}

/**
 * 게시물 좋아요 토글 React Query mutation hook
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, userId }: ToggleLikeInput) => {
      const result = await toggleLikeAction(postId, userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      // 피드 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: Error) => {
      console.error('좋아요 토글 실패:', error);
    },
    // 낙관적 업데이트 가능하도록 설정
    retry: 1,
  });
}
