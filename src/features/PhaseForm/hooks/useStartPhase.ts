import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startPhaseAction } from '../actions/startPhase.action';

type StartPhaseInput = {
  userId: string;
  templateId: string;
};

export function useStartPhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StartPhaseInput) => {
      const result = await startPhaseAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    // 낙관적 업데이트: 서버 응답 전에 즉시 UI 반영
    onMutate: async () => {
      // 진행 중인 쿼리 취소 (낙관적 업데이트와 충돌 방지)
      await queryClient.cancelQueries({ queryKey: ['phases'] });

      // 이전 상태 저장 (롤백용)
      const previousPhases = queryClient.getQueryData(['phases']);

      return { previousPhases };
    },
    onError: (err, variables, context) => {
      // 실패 시 이전 상태로 롤백
      if (context?.previousPhases) {
        queryClient.setQueryData(['phases'], context.previousPhases);
      }
      console.error('Phase 시작 실패 (롤백됨):', err);
    },
    onSettled: async () => {
      // 최종적으로 서버에서 최신 데이터 가져오기
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
