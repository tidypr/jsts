'use client';

import { useQuery } from '@tanstack/react-query';
import { getFeedAction } from '../getFeed.action';
import { FeedFilter, Post } from '../feedSchema';

interface UseFeedResult {
  posts: Post[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 피드 데이터를 가져오는 React Query hook
 * @param filter - 정렬 및 필터링 옵션
 */
export function useFeed(filter: FeedFilter = { sortBy: 'newest', limit: 20, offset: 0 }): UseFeedResult {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['feed', filter],
    queryFn: async () => {
      const result = await getFeedAction(filter);

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
