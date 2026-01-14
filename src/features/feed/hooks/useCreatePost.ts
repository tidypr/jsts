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
    onSuccess: async () => {
      // 관련 쿼리 무효화 - 자동 리페치 트리거
      await queryClient.invalidateQueries({ 
        queryKey: ['feed'],
        exact: false,
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['posts'],
        exact: false,
        refetchType: 'all'
      });
    },
    onError: (error: Error) => {
      console.error('게시물 생성 실패:', error);
    },
    // 자동 재시도 설정
    retry: 2,
    retryDelay: 1000,
  });
}
