'use client';

import { useQuery } from '@tanstack/react-query';
import { getRankAction } from '../actions/getRank.action';
import { GetRankInput, RankPeriod } from '../rankSchema';

export function useRank(period: RankPeriod = 'weekly', category?: string) {
  return useQuery({
    queryKey: ['ranks', period, category],
    queryFn: async () => {
      const input: GetRankInput = {
        period,
        category,
        limit: 20, // 상위 20명 표시
      };

      const result = await getRankAction(input);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        ranks: result.data.ranks,
        myRank: result.data.myRank,
        period: result.data.period,
      };
    },
    // 5분간 캐시 유지
    staleTime: 5 * 60 * 1000,
    // 자동 재시도 설정
    retry: 2,
    retryDelay: 1000,
  });
}
