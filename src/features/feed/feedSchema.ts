import { z } from 'zod';

// 게시물 작성자 스키마
export const postAuthorSchema = z.object({
  name: z.string(),
  handle: z.string(),
  avatar: z.string().optional(),
});

// 게시물 통계 스키마
export const postStatsSchema = z.object({
  likes: z.number(),
  comments: z.number(),
  views: z.number(),
});

// 게시물 스키마
export const postSchema = z.object({
  id: z.union([z.number(), z.string()]),
  author: postAuthorSchema,
  category: z.string().optional(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  stats: postStatsSchema,
  image: z.string().optional(),
  createdAt: z.date(),
});

export type Post = z.infer<typeof postSchema>;
export type PostAuthor = z.infer<typeof postAuthorSchema>;
export type PostStats = z.infer<typeof postStatsSchema>;

// 게시물 작성 폼 스키마
export const createPostFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력하세요')
    .max(100, '제목은 100자 이하로 입력하세요'),
  content: z
    .string()
    .min(1, '내용을 입력하세요')
    .max(1000, '내용은 1000자 이하로 입력하세요'),
  tags: z.string().optional(),
  image: z.string().optional(),
});

export type CreatePostFormData = z.infer<typeof createPostFormSchema>;

// Server Action용 게시물 생성 스키마
export const createPostInputSchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  image: z.string().optional(),
  phaseId: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostInputSchema>;

// 피드 필터 스키마
export const feedFilterSchema = z.object({
  sortBy: z.enum(['newest', 'popular', 'discussed']).default('newest'),
  category: z.string().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

export type FeedFilter = z.infer<typeof feedFilterSchema>;
