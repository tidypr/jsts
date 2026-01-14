'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendFriendRequestAction } from '../friendActions';
import { SendFriendRequestInput } from '../friendSchema';

/**
 * 친구 요청 보내기 Hook
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendFriendRequestInput) => {
      const result = await sendFriendRequestAction(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: async () => {
      // 관련 쿼리 무효화 - 자동 리페치 트리거
      await queryClient.invalidateQueries({ 
        queryKey: ['friends'],
        exact: false,
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['sentRequests'],
        exact: false,
        refetchType: 'all'
      });
    },
    onError: (error: Error) => {
      console.error('친구 요청 실패:', error);
    },
    // 자동 재시도 설정
    retry: 2,
    retryDelay: 1000,
  });
}
