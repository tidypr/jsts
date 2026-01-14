'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  MoreVertical,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import Image from 'next/image';
import { useUserFeed } from '@/features/feed/hooks/useUserFeed';
import { useRouter } from 'next/navigation';

interface MyFeedPageProps {
  userId: string;
}

export default function MyFeedPage({ userId }: MyFeedPageProps) {
  const router = useRouter();
  const [sortBy] = useState<'newest' | 'popular' | 'discussed'>('newest');

  // React Query hook으로 내 피드 데이터 가져오기
  const { posts, isLoading, isError, error } = useUserFeed(userId, {
    sortBy,
    limit: 50,
    offset: 0,
  });

  const handleBack = () => {
    router.back();
  };

  return (
    <div className='min-h-screen bg-background pb-20'>
      <div className='mx-auto'>
        {/* Header */}
        <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur'>
          <button
            onClick={handleBack}
            className='flex items-center gap-2 text-sm font-medium'
          >
            <ArrowLeft className='h-5 w-5' />
            뒤로
          </button>
          <h1 className='text-lg font-bold'>내 피드</h1>
          <div className='w-16' /> {/* Spacer for centering */}
        </div>

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
          <div className='space-y-4 px-4 py-4'>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>수정하기</DropdownMenuItem>
                      <DropdownMenuItem className='text-red-500'>
                        삭제하기
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Post Content */}
                <div className='mb-3'>
                  <p className='mb-1 text-xs text-muted-foreground'>
                    {post.category}
                  </p>
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
                <div className='flex items-center justify-between border-t pt-3'>
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && posts.length === 0 && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='mb-2 text-2xl'>📭</div>
              <p className='text-sm text-muted-foreground'>
                아직 작성한 게시물이 없습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
