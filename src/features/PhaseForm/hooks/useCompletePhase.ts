import { useMutation } from '@tanstack/react-query';
import { completePhaseAction } from '../actions/completePhase.action';

type CompletePhaseInput = {
  phaseId: string;
  note?: string;
};

export function useCompletePhase() {
  return useMutation({
    mutationFn: async (data: CompletePhaseInput) => {
      const result = await completePhaseAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}
