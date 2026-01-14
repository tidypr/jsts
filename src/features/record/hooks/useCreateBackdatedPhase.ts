'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBackdatedPhaseAction,
  createBackdatedPhaseInRangeAction,
  type CreateBackdatedPhaseInput,
} from '../actions/createBackdatedPhase.action';
import { toast } from 'sonner';

export function useCreateBackdatedPhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBackdatedPhaseInput) => {
      const result = await createBackdatedPhaseAction(input);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: async () => {
      // 관련 쿼리 무효화
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyPhases'],
        exact: false,
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ queryKey: ['phases'] });
      await queryClient.invalidateQueries({ queryKey: ['recentPhases'] });
      await queryClient.invalidateQueries({ queryKey: ['activityHeatmap'] });
      toast.success('기록이 추가되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '기록 추가에 실패했습니다');
    },
  });
}

export function useCreateBackdatedPhaseInRange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: CreateBackdatedPhaseInput & { startTime: Date },
    ) => {
      const result = await createBackdatedPhaseInRangeAction(input);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: async () => {
      // 관련 쿼리 무효화
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyPhases'],
        exact: false,
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ queryKey: ['phases'] });
      await queryClient.invalidateQueries({ queryKey: ['recentPhases'] });
      await queryClient.invalidateQueries({ queryKey: ['activityHeatmap'] });
      toast.success('기록이 추가되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '기록 추가에 실패했습니다');
    },
  });
}
