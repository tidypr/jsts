'use client';

import { useQuery } from '@tanstack/react-query';
import { getSentRequestsAction } from '../friendActions';

/**
 * 보낸 친구 요청 조회 Hook
 */
export function useSentRequests(userId: string) {
  return useQuery({
    queryKey: ['sentRequests', userId],
    queryFn: async () => {
      const result = await getSentRequestsAction(userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
