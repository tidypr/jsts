import { useMutation } from '@tanstack/react-query';
import { deletePhaseAction } from '../actions/deletePhase.action';

type DeletePhaseInput = {
  phaseId: string;
};

export function useDeletePhase() {
  return useMutation({
    mutationFn: async (data: DeletePhaseInput) => {
      const result = await deletePhaseAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}
