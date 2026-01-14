import { useQuery } from '@tanstack/react-query';
import { getDailyPhases } from '../actions/getDailyPhases.action';

export function useDailyPhases(userId: string, date: Date) {
  return useQuery({
    queryKey: ['dailyPhases', userId, date.toISOString().split('T')[0]],
    queryFn: async () => {
      const result = await getDailyPhases(userId, date);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 0, // 항상 최신 데이터 가져오기
    refetchOnMount: true, // 컴포넌트 마운트 시 데이터 다시 가져오기
  });
}
