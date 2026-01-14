import { useQuery } from '@tanstack/react-query';
import { getPhaseByIdAction } from '../actions/getPhaseById.action';

export function usePhase(phaseId: string | null) {
  return useQuery({
    queryKey: ['phase', phaseId],
    queryFn: async () => {
      if (!phaseId) {
        throw new Error('Phase ID가 필요합니다.');
      }
      const result = await getPhaseByIdAction(phaseId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!phaseId,
    // phaseId가 없을 때는 로딩 상태를 false로 유지
    placeholderData: undefined,
  });
}
