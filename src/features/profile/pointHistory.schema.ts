import { z } from 'zod';

// Zod schema for Point
export const PointSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  type: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  userId: z.string().uuid(),
});

export type PointHistory = z.infer<typeof PointSchema>;

// Schema for point history list response
export const PointHistoryListSchema = z.array(PointSchema);

export type PointHistoryList = z.infer<typeof PointHistoryListSchema>;
