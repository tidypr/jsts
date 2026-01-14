import { useQuery } from '@tanstack/react-query';
import { getGoalProgress } from '../actions/goals.actions';

export function useGoalProgress() {
  return useQuery({
    queryKey: ['goal-progress'],
    queryFn: async () => {
      const result = await getGoalProgress();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}
