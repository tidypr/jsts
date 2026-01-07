'use client';

import { useQuery } from '@tanstack/react-query';
import { getRankAction } from '../getRank.action';
import { GetRankInput, RankPeriod } from '../rankSchema';

export function useRank(period: RankPeriod = 'weekly', category?: string) {
  return useQuery({
    queryKey: ['ranks', period, category],
    queryFn: async () => {
      const input: GetRankInput = {
        period,
        category,
        limit: 10,
      };

      const result = await getRankAction(input);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    // 5분간 캐시 유지
    staleTime: 5 * 60 * 1000,
    // 자동 재시도 설정
    retry: 2,
    retryDelay: 1000,
  });
}
