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
    onSuccess: () => {
      // 관련 쿼리 무효화 - 자동 리페치 트리거
      queryClient.invalidateQueries({ queryKey: ['phases'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['timer'] });
    },
    onError: (error: Error) => {
      console.error('Phase 생성 실패:', error);
    },
    // 자동 재시도 설정
    retry: 2,
    retryDelay: 1000,
  });
}
