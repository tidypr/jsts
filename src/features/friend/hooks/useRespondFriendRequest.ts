'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { respondFriendRequestAction } from '../friendActions';
import { RespondFriendRequestInput } from '../friendSchema';

/**
 * 친구 요청 수락/거절 Hook
 */
export function useRespondFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RespondFriendRequestInput) => {
      const result = await respondFriendRequestAction(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      // 관련 쿼리 무효화 - 자동 리페치 트리거
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
    onError: (error: Error) => {
      console.error('친구 요청 응답 실패:', error);
    },
    // 자동 재시도 설정
    retry: 2,
    retryDelay: 1000,
  });
}
