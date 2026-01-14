'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllPhasesAction } from '../actions/getPhases.action';

export function useAllPhases(userId: string) {
  return useQuery({
    queryKey: ['phases', 'all', userId],
    queryFn: async () => {
      const result = await getAllPhasesAction(userId);

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
