import { z } from 'zod';

export const updateProfileNameSchema = z.object({
  name: z
    .string()
    .min(1, '이름은 최소 1자 이상이어야 합니다')
    .max(50, '이름은 최대 50자까지 입력 가능합니다')
    .trim(),
});

export const updateProfileImageSchema = z.object({
  image: z.string().url('유효한 이미지 URL이어야 합니다'),
});

export type UpdateProfileName = z.infer<typeof updateProfileNameSchema>;
export type UpdateProfileImage = z.infer<typeof updateProfileImageSchema>;
