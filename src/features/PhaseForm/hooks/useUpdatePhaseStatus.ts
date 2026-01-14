import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePhaseStatusAction } from '../actions/updatePhaseStatus.action';

type UpdatePhaseStatusInput = {
  phaseId: string;
  status: 'STARTED' | 'PAUSED' | 'COMPLETED';
};

export function useUpdatePhaseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePhaseStatusInput) => {
      const result = await updatePhaseStatusAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    // 낙관적 업데이트: 일시정지/재개 즉시 반영
    onMutate: async (variables) => {
      // 해당 Phase 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: ['phase', variables.phaseId],
      });
      await queryClient.cancelQueries({ queryKey: ['phases'] });

      // 이전 상태 저장
      const previousPhase = queryClient.getQueryData([
        'phase',
        variables.phaseId,
      ]);
      const previousPhases = queryClient.getQueryData(['phases']);

      // 낙관적으로 캐시 업데이트
      queryClient.setQueryData(['phase', variables.phaseId], (old: unknown) => {
        if (!old) return old;
        return { ...(old as Record<string, unknown>), status: variables.status };
      });

      return { previousPhase, previousPhases };
    },
    onError: (err, variables, context) => {
      // 실패 시 롤백
      if (context?.previousPhase) {
        queryClient.setQueryData(
          ['phase', variables.phaseId],
          context.previousPhase,
        );
      }
      if (context?.previousPhases) {
        queryClient.setQueryData(['phases'], context.previousPhases);
      }
      console.error('Phase 상태 업데이트 실패 (롤백됨):', err);
    },
    onSettled: async (data, error, variables) => {
      // 최종 동기화
      await queryClient.invalidateQueries({ queryKey: ['phase', variables.phaseId] });
      await queryClient.invalidateQueries({ 
        queryKey: ['dailyPhases'],
        exact: false,
        refetchType: 'all'
      });
      await queryClient.invalidateQueries({ queryKey: ['phases'] });
      await queryClient.invalidateQueries({ queryKey: ['recentPhases'] });
    },
  });
}
