import { z } from 'zod';

export const rankUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  totalMinutes: z.number(),
  rank: z.number(),
  category: z.string().optional(),
});

export type RankUser = z.infer<typeof rankUserSchema>;

export const rankPeriodSchema = z.enum(['daily', 'weekly', 'monthly', 'all']);

export type RankPeriod = z.infer<typeof rankPeriodSchema>;

export const getRankInputSchema = z.object({
  period: rankPeriodSchema,
  category: z.string().optional(),
  limit: z.number().optional().default(10),
});

export type GetRankInput = z.infer<typeof getRankInputSchema>;

export const getRankResponseSchema = z.object({
  ranks: z.array(rankUserSchema),
  myRank: rankUserSchema.nullable(),
  period: rankPeriodSchema,
});

export type GetRankResponse = z.infer<typeof getRankResponseSchema>;
