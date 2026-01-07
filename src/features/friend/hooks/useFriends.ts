'use client';

import { useQuery } from '@tanstack/react-query';
import { getFriendsAction } from '../friendActions';

/**
 * 친구 목록 조회 Hook
 */
export function useFriends(userId: string) {
  return useQuery({
    queryKey: ['friends', userId],
    queryFn: async () => {
      const result = await getFriendsAction(userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: true,
  });
}
