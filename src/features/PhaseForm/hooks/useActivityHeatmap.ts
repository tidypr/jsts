'use client';

import { useQuery } from '@tanstack/react-query';
import { getActivityHeatmapAction } from '../actions/getActivityHeatmap.action';

export function useActivityHeatmap(userId: string, days: number = 365) {
  return useQuery({
    queryKey: ['phases', 'heatmap', userId, days],
    queryFn: async () => {
      const result = await getActivityHeatmapAction(userId, days);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10분간 fresh
    gcTime: 1000 * 60 * 30, // 30분간 cache 유지
  });
}
