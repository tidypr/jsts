import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sharePhaseToFeedAction } from '../actions/sharePhaseToFeed.action';
import { SharePhaseToFeedInput } from '../sharePhaseToFeed.schema';

/**
 * Phase 완료 내용을 Feed에 공유하는 React Query hook
 */
export function useSharePhaseToFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SharePhaseToFeedInput) => {
      const result = await sharePhaseToFeedAction(input);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: async () => {
      // 성공 시 feed 쿼리 무효화하여 새로고침
      await queryClient.invalidateQueries({ 
        queryKey: ['feed'],
        exact: false,
        refetchType: 'all'
      });
    },
    onError: (error: Error) => {
      console.error('Feed 공유 실패:', error);
    },
  });
}
