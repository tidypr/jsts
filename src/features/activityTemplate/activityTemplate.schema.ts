import { z } from 'zod';

export const activityTemplateSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  note: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, '올바른 색상 코드를 입력해주세요'),
  emoji: z.string().optional(),
  defaultTime: z.number().min(60, '최소 1분 이상 설정해주세요'), // 초 단위
  useInTimer: z.boolean().default(true),
});

export type ActivityTemplateInput = z.infer<typeof activityTemplateSchema>;

export interface ActivityTemplate {
  id: string;
  title: string;
  note: string | null;
  color: string;
  emoji: string | null;
  defaultTime: number;
  useInTimer: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
