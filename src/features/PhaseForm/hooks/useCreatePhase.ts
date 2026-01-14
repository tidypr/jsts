'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPhaseAction } from '../actions/createPhase.action';
import { CreatePhaseInput } from '../phaseSchema';

export function useCreatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePhaseInput) => {
      const result = await createPhaseAction(data);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: async (data) => {
      // 관련 쿼리 무효화 - 자동 리페치 트리거
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyPhases'],
        exact: false,
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ queryKey: ['phases'] });
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
      await queryClient.invalidateQueries({ queryKey: ['timer'] });
      await queryClient.invalidateQueries({ queryKey: ['recentPhases', data.userId] });
      await queryClient.invalidateQueries({ queryKey: ['activityHeatmap', data.userId] });
      await queryClient.invalidateQueries({ queryKey: ['goal-progress'] });
    },
    onError: (error: Error) => {
      console.error('Phase 생성 실패:', error);
    },
    // 자동 재시도 설정
    retry: 2,
    retryDelay: 1000,
  });
}
