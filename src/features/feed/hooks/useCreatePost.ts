'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPostAction } from '../actions/createPost.action';
import { CreatePostInput } from '../feedSchema';

/**
 * 게시물 생성 React Query mutation hook
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const result = await createPostAction(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      // 관련 쿼리 무효화 - 자동 리페치 트리거
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      console.error('게시물 생성 실패:', error);
    },
    // 자동 재시도 설정
    retry: 2,
    retryDelay: 1000,
  });
}
