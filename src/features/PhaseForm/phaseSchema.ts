import { z } from 'zod';

export const phaseSchema = z.object({
  date: z.string().min(1, '날짜를 선택하세요'),
  category: z.string().min(1, '색상을 선택하세요'),
  startTime: z.string().min(1, '시작 시간을 입력하세요'),
  endTime: z.string().min(1, '종료 시간을 입력하세요'),
  note: z.string().min(1, '메모를 입력하세요'),
  isAutomatic: z.boolean().optional(),
});

export type PhaseFormData = z.infer<typeof phaseSchema>;

export const createPhaseInputSchema = z.object({
  userId: z.string(),
  category: z.string(), // Color value (e.g., #22c55e)
  startTime: z.date(),
  endTime: z.date(),
  note: z.string(),
  isAutomatic: z.boolean().optional(),
});

export type CreatePhaseInput = z.infer<typeof createPhaseInputSchema>;
