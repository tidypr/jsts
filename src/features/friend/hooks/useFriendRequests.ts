'use client';

import { useQuery } from '@tanstack/react-query';
import { getFriendRequestsAction } from '../friendActions';

/**
 * 받은 친구 요청 조회 Hook
 */
export function useFriendRequests(userId: string) {
  return useQuery({
    queryKey: ['friendRequests', userId],
    queryFn: async () => {
      const result = await getFriendRequestsAction(userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 3, // 3분
    refetchInterval: 1000 * 60, // 1분마다 자동 갱신
  });
}
