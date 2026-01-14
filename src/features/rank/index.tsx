'use client';

import { Card } from '@/shared/components/ui/card';
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar';
import { useRank } from './hooks/useRank';

const categoryMap: Record<string, { label: string; icon: string }> = {
  math: { label: '수학', icon: '📐' },
  english: { label: '영어', icon: '📚' },
  science: { label: '과학', icon: '🔬' },
  coding: { label: '코딩', icon: '💻' },
  reading: { label: '독서', icon: '📖' },
};

export default function RankList() {
  // React Query hook - 전체 기간, 전체 카테고리로 고정
  const {
    data: rankData,
    isLoading,
    isError,
    error,
  } = useRank('all', undefined);
  /**
   * 시간을 시:분 형식으로 변환
   */
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  /**
   * 순위에 따른 카드 스타일
   */
  const getRankCardStyle = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'border-amber-500/70 bg-amber-500/30';
      case 2:
        return 'border-gray-400/70 bg-gray-400/30';
      case 3:
        return 'border-orange-700/70 bg-orange-700/30';
      default:
        return '';
    }
  };

  if (isError) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Card className='border-red-500/30 bg-red-500/10 p-6'>
          <p className='text-red-500'>
            {error?.message || '순위를 불러올 수 없습니다.'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    // <div className=' px-4 pb-8 pt-6'>
    <div className='mx-auto min-h-screen max-w-2xl space-y-6'>
      {/* My Rank */}
      {rankData?.myRank && (
        <Card className='border-[#22c55e]/30 bg-[#22c55e]/10 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <span className='text-2xl font-bold'>
                {rankData.myRank.rank} 위
              </span>
              <div>
                <p className='font-semibold text-[#22c55e]'>내 순위</p>
                <p className='text-sm text-muted-foreground'>
                  {rankData.myRank.name}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-lg font-bold text-[#22c55e]'>
                {formatMinutes(rankData.myRank.totalMinutes)}
              </p>
              <p className='text-xs text-muted-foreground'>총 학습시간</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className='space-y-3'>
          {[...Array(5)].map((_, i) => (
            <Card key={i} className='animate-pulse p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-full bg-gray-700' />
                  <div className='space-y-2'>
                    <div className='h-4 w-24 rounded bg-gray-700' />
                    <div className='h-3 w-16 rounded bg-gray-700' />
                  </div>
                </div>
                <div className='h-6 w-20 rounded bg-gray-700' />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rank List */}
      {rankData && !isLoading && (
        <div className='space-y-3' data-testid='rank-list'>
          {rankData.ranks.map((user) => (
            <Card
              key={user.id}
              className={`p-4 transition-colors hover:bg-accent ${getRankCardStyle(user.rank)}`}
              data-testid={`rank-item-${user.rank}`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  {/* Rank Badge */}
                  <div className='flex w-12 items-center justify-center'>
                    <span className='text-lg font-bold'># {user.rank}</span>
                  </div>

                  {/* User Info */}
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-[#22c55e]/70 to-[#22c55e] text-white'>
                        {/* {user.name.charAt(0)} */}
                        {/* {user.avatar} */}
                        {user.avatar && (
                          <AvatarImage
                            src={user.avatar}
                            alt='프로필 사진'
                            data-testid='profile-avatar-image'
                          />
                        )}
                      </div>
                    </Avatar>
                    <div>
                      <p className='font-semibold'>{user.name}</p>
                      {user.category && categoryMap[user.category] && (
                        <p className='text-xs text-muted-foreground'>
                          {categoryMap[user.category].icon}{' '}
                          {categoryMap[user.category].label}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className='text-right'>
                  <p className='text-lg font-bold text-[#22c55e]'>
                    {formatMinutes(user.totalMinutes)}
                  </p>
                  <p className='text-xs text-muted-foreground'>총 학습</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {rankData && rankData.ranks.length === 0 && !isLoading && (
        <Card className='p-8 text-center'>
          <p className='text-muted-foreground'>순위 데이터가 없습니다.</p>
        </Card>
      )}
    </div>
    // </div>
  );
}
