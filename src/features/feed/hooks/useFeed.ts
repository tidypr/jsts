'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeedAction } from '../actions/getFeed.action';
import { FeedFilter, Post } from '../feedSchema';

interface UseInfiniteFeedResult {
  posts: Post[];
  total: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  isError: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  refetch: () => void;
}

/**
 * 무한스크롤 피드 데이터를 가져오는 React Query hook
 * @param filter - 정렬 및 필터링 옵션 (limit만 사용, offset은 자동 계산)
 */
export function useFeed(
  filter: Omit<FeedFilter, 'offset'> = { sortBy: 'newest', limit: 20 },
): UseInfiniteFeedResult {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    error,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed', filter],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getFeedAction({
        ...filter,
        offset: pageParam,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (sum, page) => sum + page.posts.length,
        0,
      );
      // 더 가져올 데이터가 있으면 다음 offset 반환
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    initialPageParam: 0,
    // 캐싱 설정
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분 (구 cacheTime)
    // 자동 리페치 설정
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // 모든 페이지의 posts를 flat하게 합치기
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return {
    posts: allPosts,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    isError,
    error: error as Error | null,
    fetchNextPage,
    refetch,
  };
}
