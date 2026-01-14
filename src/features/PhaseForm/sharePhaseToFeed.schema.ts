import { z } from 'zod';

// Phase를 Feed에 공유하기 위한 스키마
export const sharePhaseToFeedSchema = z.object({
  userId: z.string(),
  phaseId: z.string(),
  category: z.string(),
  completedTime: z.number(), // seconds
  note: z.string().optional(),
});

export type SharePhaseToFeedInput = z.infer<typeof sharePhaseToFeedSchema>;
