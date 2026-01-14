'use client';

import { useState, useEffect, useRef } from 'react';
// import { Button } from '@/shared/components/ui/button';
import {
  // Search,
  // Bell,
  // MoreVertical,
  // Heart,
  MessageCircle,
  // Eye,
  Flame,
  TrendingUp,
  // Edit,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/shared/components/ui/dropdown-menu';
import Image from 'next/image';
import { useFeed } from '../hooks/useFeed';
import { PostForm } from './PostForm';

export function Feed({ userId }: { userId?: string }) {
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'discussed'>(
    'newest',
  );
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  // React Query hook으로 피드 데이터 가져오기 (무한스크롤)
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    error,
    fetchNextPage,
  } = useFeed({
    sortBy,
    limit: 10,
  });

  // 무한스크롤을 위한 Intersection Observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // PostForm 모달 렌더링
  if (showPostForm) {
    return <PostForm onClose={() => setShowPostForm(false)} userId={userId} />;
  }

  return (
    <div className='min-h-screen bg-background pb-20'>
      <div className='mx-auto'>
        {/* Loading State */}
        {isLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='mb-2 text-2xl'>⏳</div>
              <p className='text-sm text-muted-foreground'>
                피드를 불러오는 중...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='mb-2 text-2xl'>⚠️</div>
              <p className='text-sm text-red-500'>
                {error?.message || '피드를 불러오는 중 오류가 발생했습니다.'}
              </p>
            </div>
          </div>
        )}

        {/* Posts List */}
        {!isLoading && !isError && posts.length > 0 && (
          // <div className='px-4'>
          <div className='space-y-4 py-2'>
            {posts.map((post) => (
              <div
                key={post.id}
                className='overflow-hidden rounded-xl border bg-card p-4'
              >
                {/* Post Header */}
                <div className='mb-3 flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        {post.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-semibold'>
                        {post.author.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {post.author.handle}
                      </p>
                    </div>
                  </div>
                  {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>신고하기</DropdownMenuItem>
                      <DropdownMenuItem>공유하기</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> */}
                </div>

                {/* Post Content */}
                <div className='mb-3'>
                  <h3 className='mb-2 text-base font-bold'>{post.title}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {post.content}
                  </p>
                </div>

                {/* Post Image */}
                {post.image && (
                  <div className='mb-3 overflow-hidden rounded-lg'>
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={300}
                      className='w-full object-cover'
                    />
                  </div>
                )}

                {/* Post Tags */}
                {post.tags.length > 0 && (
                  <div className='mb-3 flex flex-wrap gap-2'>
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className='text-xs text-[#22c55e]'>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Stats & Actions */}
                {/* <div className='flex items-center justify-between border-t pt-3'>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <button className='flex items-center gap-1 transition-colors hover:text-[#22c55e]'>
                      <Heart className='h-4 w-4' />
                      <span>{post.stats.likes}</span>
                    </button>
                    <button className='flex items-center gap-1 transition-colors hover:text-[#22c55e]'>
                      <MessageCircle className='h-4 w-4' />
                      <span>{post.stats.comments}</span>
                    </button>
                    <span className='flex items-center gap-1'>
                      <Eye className='h-4 w-4' />
                      <span>{post.stats.views}</span>
                    </span>
                  </div>
                </div> */}
              </div>
            ))}
          </div>
          // </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && posts.length === 0 && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='mb-2 text-2xl'>📭</div>
              <p className='text-sm text-muted-foreground'>
                아직 게시물이 없습니다.
              </p>
            </div>
          </div>
        )}

        {/* Infinite Scroll Observer Target */}
        {!isLoading && !isError && posts.length > 0 && (
          <div ref={observerTarget} className='py-4'>
            {isFetchingNextPage && (
              <div className='flex items-center justify-center'>
                <div className='text-center'>
                  <div className='mb-2 text-2xl'>⏳</div>
                  <p className='text-sm text-muted-foreground'>
                    더 많은 게시물을 불러오는 중...
                  </p>
                </div>
              </div>
            )}
            {!hasNextPage && posts.length > 0 && (
              <div className='flex items-center justify-center py-4'>
                <p className='text-sm text-muted-foreground'>
                  모든 게시물을 확인했습니다 ✨
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sort Menu Modal */}
      {showSortMenu && (
        <div className='fixed inset-0 z-50 flex items-end'>
          <div
            className='absolute inset-0 bg-black/60'
            onClick={() => setShowSortMenu(false)}
          />
          <div className='animate-slide-up relative w-full space-y-3 rounded-t-3xl p-6'>
            <h3 className='mb-4 font-semibold'>피드 정렬</h3>
            <button
              onClick={() => {
                setSortBy('newest');
                setShowSortMenu(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl p-4 transition-colors ${
                sortBy === 'newest' ? 'bg-[#22c55e]/20' : 'hover:bg-[#222]'
              }`}
              data-testid='feed-sort-newest'
            >
              <span className='flex items-center gap-3'>
                <Flame className='h-5 w-5' />
                최신순
              </span>
              {sortBy === 'newest' && (
                <div className='h-2 w-2 rounded-full bg-[#22c55e]' />
              )}
            </button>
            <button
              onClick={() => {
                setSortBy('popular');
                setShowSortMenu(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl p-4 transition-colors ${
                sortBy === 'popular' ? 'bg-[#22c55e]/20' : 'hover:bg-[#222]'
              }`}
              data-testid='feed-sort-popular'
            >
              <span className='flex items-center gap-3'>
                <TrendingUp className='h-5 w-5' />
                인기순
              </span>
              {sortBy === 'popular' && (
                <div className='h-2 w-2 rounded-full bg-[#22c55e]' />
              )}
            </button>
            <button
              onClick={() => {
                setSortBy('discussed');
                setShowSortMenu(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl p-4 transition-colors ${
                sortBy === 'discussed' ? 'bg-[#22c55e]/20' : 'hover:bg-[#222]'
              }`}
              data-testid='feed-sort-discussed'
            >
              <span className='flex items-center gap-3'>
                <MessageCircle className='h-5 w-5' />
                댓글 많은순
              </span>
              {sortBy === 'discussed' && (
                <div className='h-2 w-2 rounded-full bg-[#22c55e]' />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {/* <button
        className='fixed bottom-24 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e] shadow-lg transition-colors hover:bg-[#22c55e]/90'
        onClick={() => setShowPostForm(true)}
        data-testid='feed-create-post-button'
      >
        <Edit className='h-6 w-6 text-black' />
      </button> */}
    </div>
  );
}
