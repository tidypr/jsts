'use client';

import { useQuery } from '@tanstack/react-query';
import { getRecentPhasesAction } from '../getPhases.action';

export function useRecentPhases(userId: string, limit: number = 3) {
  return useQuery({
    queryKey: ['phases', 'recent', userId, limit],
    queryFn: async () => {
      const result = await getRecentPhasesAction(userId, limit);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    gcTime: 1000 * 60 * 10, // 10분간 cache 유지
  });
}
