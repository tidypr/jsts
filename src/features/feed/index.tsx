'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Search,
  Bell,
  MoreVertical,
  Heart,
  MessageCircle,
  Eye,
  Flame,
  TrendingUp,
  Edit,
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
import { useFeed } from './hooks/useFeed';
import PostForm from './PostForm';

const exploreBoards = [
  { icon: '✓', title: 'Daily Check-in', color: 'bg-[#22c55e]' },
  { icon: '💡', title: 'Tips & Tricks', color: 'bg-[#3b82f6]' },
  { icon: '❓', title: 'Q&A', color: 'bg-[#8b5cf6]' },
];

const hotTopics = [
  {
    title: 'Passed my JLPT N2! 🎉',
    description:
      'Finally passed after 6 months of intense study. Sharing my vocal list...',
    stats: { likes: 125, comments: 942 },
  },
  {
    title: 'Weekly Morning Routine',
    description: 'Wake up at 5 AM to crush goals with this exact routine...',
    stats: { likes: 86, comments: 531 },
  },
];

interface FeedProps {
  userId?: string;
}

export default function Feed({ userId }: FeedProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'discussed'>(
    'newest',
  );
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  // React Query hook으로 피드 데이터 가져오기
  const { posts, isLoading, isError, error } = useFeed({ sortBy, limit: 20, offset: 0 });

  // PostForm 모달 렌더링
  if (showPostForm) {
    return <PostForm onClose={() => setShowPostForm(false)} userId={userId} />;
  }

  return (
    <div className='min-h-screen bg-background pb-20'>
      {/* Header */}
      <header className='sticky top-0 z-10 border-b border-[#1f1f1f]'>
        <div className='mx-auto flex items-center justify-between px-4 py-4'>
          <h1 className='text-2xl font-bold'>Social</h1>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              className='text-muted-foreground'
            >
              <Search className='h-5 w-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='text-muted-foreground'
            >
              <Bell className='h-5 w-5' />
            </Button>
          </div>
        </div>

        {/* Feed Filter */}
        <div className='mx-auto flex items-center justify-between px-4 pb-3'>
          <div className='flex items-center gap-2'>
            <Flame className='h-5 w-5 text-[#22c55e]' />
            <span className='font-semibold'>Live Feed</span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='text-sm text-[#22c55e] hover:text-[#22c55e]/80'
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            View All
          </Button>
        </div>
      </header>

      <div className='mx-auto'>
        {/* Explore Boards */}
        <div className='px-4 py-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Explore Boards</h2>
            <Button
              variant='ghost'
              size='sm'
              className='text-sm text-muted-foreground'
            >
              →
            </Button>
          </div>
          <div className='grid grid-cols-3 gap-3'>
            {exploreBoards.map((board) => (
              <button
                key={board.title}
                className='flex flex-col items-center gap-2 rounded-xl p-4 transition-colors hover:bg-[#222]'
              >
                <div
                  className={`h-12 w-12 rounded-full ${board.color} flex items-center justify-center text-2xl`}
                >
                  {board.icon}
                </div>
                <span className='text-center text-xs'>{board.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='mb-2 text-2xl'>⏳</div>
              <p className='text-sm text-muted-foreground'>피드를 불러오는 중...</p>
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

        {/* Posts Feed */}
        <div className='space-y-4 px-4'>
          {!isLoading && !isError && posts.map((post) => (
            <div key={post.id} className='space-y-3 rounded-2xl p-4'>
              {/* Post Header */}
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='text-sm font-semibold'>
                      {post.author.name}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {post.category}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='border-[#2a2a2a]'>
                    <DropdownMenuItem>Report</DropdownMenuItem>
                    <DropdownMenuItem>Hide</DropdownMenuItem>
                    <DropdownMenuItem>Save</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Post Content */}
              <div className='space-y-2'>
                <h3 className='font-semibold'>{post.title}</h3>
                <p className='line-clamp-2 text-sm text-muted-foreground'>
                  {post.content}
                </p>
                {post.image && (
                  <div className='overflow-hidden rounded-lg'>
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={600}
                      height={400}
                      className='h-48 w-full object-cover'
                    />
                  </div>
                )}
                <div className='flex flex-wrap gap-2'>
                  {post.tags.map((tag) => (
                    <span key={tag} className='text-xs text-[#22c55e]'>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Post Stats */}
              <div className='flex items-center justify-between border-t border-[#2a2a2a] pt-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='gap-2 text-muted-foreground hover:text-foreground'
                >
                  <Heart className='h-4 w-4' />
                  <span className='text-sm'>{post.stats.likes}</span>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='gap-2 text-muted-foreground hover:text-foreground'
                >
                  <MessageCircle className='h-4 w-4' />
                  <span className='text-sm'>{post.stats.comments}</span>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='gap-2 text-muted-foreground hover:text-foreground'
                >
                  <Eye className='h-4 w-4' />
                  <span className='text-sm'>{post.stats.views}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Hot Topics Sidebar (appears at bottom on mobile) */}
        <div className='px-4 py-6'>
          <h2 className='mb-4 text-lg font-semibold'>Hot Topics</h2>
          <div className='space-y-3'>
            {hotTopics.map((topic, idx) => (
              <div
                key={idx}
                className='flex gap-3 overflow-hidden rounded-xl p-3'
              >
                <div className='h-24 w-24 flex-shrink-0 rounded-lg bg-[#1f1f1f] flex items-center justify-center'>
                  <span className='text-2xl'>🔥</span>
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-1 line-clamp-1 text-sm font-semibold'>
                    {topic.title}
                  </h3>
                  <p className='mb-2 line-clamp-2 text-xs text-muted-foreground'>
                    {topic.description}
                  </p>
                  <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <Heart className='h-3 w-3' /> {topic.stats.likes}
                    </span>
                    <span className='flex items-center gap-1'>
                      <MessageCircle className='h-3 w-3' />{' '}
                      {topic.stats.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Menu Modal */}
      {showSortMenu && (
        <div className='fixed inset-0 z-50 flex items-end'>
          <div
            className='absolute inset-0 bg-black/60'
            onClick={() => setShowSortMenu(false)}
          />
          <div className='animate-slide-up relative w-full space-y-3 rounded-t-3xl p-6'>
            <h3 className='mb-4 font-semibold'>Sort Feed By</h3>
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
      <button
        className='fixed bottom-24 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e] shadow-lg transition-colors hover:bg-[#22c55e]/90'
        onClick={() => setShowPostForm(true)}
        data-testid='feed-create-post-button'
      >
        <Edit className='h-6 w-6 text-black' />
      </button>
    </div>
  );
}
