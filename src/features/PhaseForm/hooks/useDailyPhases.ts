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
  });
}
