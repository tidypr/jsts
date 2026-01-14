import { z } from 'zod';

export const GoalTypeEnum = z.enum(['DAILY', 'WEEKLY', 'MONTHLY']);

export const goalSchema = z.object({
  type: GoalTypeEnum,
  targetMinutes: z
    .number()
    .min(1, '목표 시간은 최소 1분 이상이어야 합니다')
    .max(10080, '월간 목표는 최대 10080분(1주일)을 초과할 수 없습니다'),
});

export const createGoalSchema = goalSchema;
export const updateGoalSchema = goalSchema;

export type GoalFormData = z.infer<typeof goalSchema>;
export type GoalType = z.infer<typeof GoalTypeEnum>;
