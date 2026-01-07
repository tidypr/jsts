'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteFriendAction } from '../friendActions';
import { DeleteFriendInput } from '../friendSchema';

/**
 * 친구 삭제 Hook
 */
export function useDeleteFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteFriendInput) => {
      const result = await deleteFriendAction(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      // 관련 쿼리 무효화 - 자동 리페치 트리거
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: Error) => {
      console.error('친구 삭제 실패:', error);
    },
    // 자동 재시도 설정
    retry: 1,
    retryDelay: 1000,
  });
}
