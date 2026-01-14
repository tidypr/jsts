'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserFeedAction } from '../actions/getUserFeed.action';
import { FeedFilter, Post } from '../feedSchema';

interface UseUserFeedResult {
  posts: Post[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 특정 사용자의 피드 데이터를 가져오는 React Query hook
 * @param userId - 사용자 ID
 * @param filter - 정렬 및 필터링 옵션
 */
export function useUserFeed(
  userId: string,
  filter: FeedFilter = { sortBy: 'newest', limit: 20, offset: 0 },
): UseUserFeedResult {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['userFeed', userId, filter],
    queryFn: async () => {
      const result = await getUserFeedAction(userId, filter);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    // 캐싱 설정
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분 (구 cacheTime)
    // 자동 리페치 설정
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // userId가 없으면 쿼리 실행하지 않음
    enabled: !!userId,
  });

  return {
    posts: data?.posts ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
