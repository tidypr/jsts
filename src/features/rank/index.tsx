'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Avatar } from '@/shared/components/ui/avatar';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useRank } from './hooks/useRank';
import { RankPeriod } from './rankSchema';

const periods = [
  { value: 'daily', label: '일간' },
  { value: 'weekly', label: '주간' },
  { value: 'monthly', label: '월간' },
  { value: 'all', label: '전체' },
] as const;

const categories = [
  { value: 'all', label: '전체' },
  { value: 'math', label: '수학', icon: '📐' },
  { value: 'english', label: '영어', icon: '📚' },
  { value: 'science', label: '과학', icon: '🔬' },
  { value: 'coding', label: '코딩', icon: '💻' },
  { value: 'reading', label: '독서', icon: '📖' },
];

const categoryMap: Record<string, { label: string; icon: string }> = {
  math: { label: '수학', icon: '📐' },
  english: { label: '영어', icon: '📚' },
  science: { label: '과학', icon: '🔬' },
  coding: { label: '코딩', icon: '💻' },
  reading: { label: '독서', icon: '📖' },
};

export default function RankList() {
  // State for filters
  const [selectedPeriod, setSelectedPeriod] = useState<RankPeriod>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // React Query hook
  const {
    data: rankData,
    isLoading,
    isError,
    error,
  } = useRank(
    selectedPeriod,
    selectedCategory === 'all' ? undefined : selectedCategory,
  );

  /**
   * 시간을 시:분 형식으로 변환
   */
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  /**
   * 순위에 따른 메달 이모지
   */
  const getRankBadge = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
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
    <div className='min-h-screen px-4 pb-8 pt-6'>
      <div className='mx-auto max-w-2xl space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-center'>
          <h1 className='text-2xl font-bold'>🏆 학습 순위</h1>
        </div>

        {/* Filters */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>기간</Label>
            <Select
              value={selectedPeriod}
              onValueChange={(value) => setSelectedPeriod(value as RankPeriod)}
            >
              <SelectTrigger
                className='border-[#1f1f1f]'
                data-testid='rank-period-select'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='border-[#1f1f1f]'>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>카테고리</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger
                className='border-[#1f1f1f]'
                data-testid='rank-category-select'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='border-[#1f1f1f]'>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className='flex items-center gap-2'>
                      {cat.icon && <span>{cat.icon}</span>}
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* My Rank */}
        {rankData?.myRank && (
          <Card className='border-[#22c55e]/30 bg-[#22c55e]/10 p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <span className='text-2xl font-bold'>
                  {getRankBadge(rankData.myRank.rank)}
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
                className='p-4 transition-colors hover:bg-accent'
                data-testid={`rank-item-${user.rank}`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    {/* Rank Badge */}
                    <div className='flex w-12 items-center justify-center'>
                      <span className='text-2xl font-bold'>
                        {getRankBadge(user.rank)}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-10 w-10'>
                        <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white'>
                          {user.name.charAt(0)}
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
    </div>
  );
}
