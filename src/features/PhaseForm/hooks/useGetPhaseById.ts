import { useQuery } from '@tanstack/react-query';
import { getPhaseByIdAction } from '../actions/getPhaseById.action';

export function useGetPhaseById(phaseId: string | null, enablePolling = false) {
  return useQuery({
    queryKey: ['phase', phaseId],
    queryFn: async () => {
      if (!phaseId) {
        return null;
      }
      const result = await getPhaseByIdAction(phaseId);
      console.log('useGetPhaseById result:', result);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!phaseId,
    // 🔄 폴링: 5초마다 서버에서 최신 Phase 데이터 조회
    refetchInterval: enablePolling ? 5000 : false,
    refetchIntervalInBackground: true, // 백그라운드 탭에서도 폴링 유지
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
