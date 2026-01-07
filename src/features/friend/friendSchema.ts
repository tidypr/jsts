import { z } from 'zod';

// Friend 타입 정의
export const friendSchema = z.object({
  id: z.string(),
  userId: z.string(),
  friendId: z.string(),
  friendName: z.string(),
  friendEmail: z.string(),
  friendAvatar: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  createdAt: z.date(),
});

export type Friend = z.infer<typeof friendSchema>;

// Friend 요청 보내기 스키마
export const sendFriendRequestSchema = z.object({
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  friendEmail: z.string().email('올바른 이메일을 입력하세요'),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;

// Friend 요청 수락/거절 스키마
export const respondFriendRequestSchema = z.object({
  requestId: z.string().min(1, '요청 ID가 필요합니다'),
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  accept: z.boolean(),
});

export type RespondFriendRequestInput = z.infer<
  typeof respondFriendRequestSchema
>;

// Friend 삭제 스키마
export const deleteFriendSchema = z.object({
  friendId: z.string().min(1, '친구 ID가 필요합니다'),
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
});

export type DeleteFriendInput = z.infer<typeof deleteFriendSchema>;
