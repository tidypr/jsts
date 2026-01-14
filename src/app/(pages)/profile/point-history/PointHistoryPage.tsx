'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ArrowLeft,
  Coins,
  TrendingUp,
  TrendingDown,
  History,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { PointHistoryList } from '@/features/profile/pointHistory.schema';
import { useRouter } from 'next/navigation';

interface PointHistoryPageProps {
  pointHistory: PointHistoryList;
}

export default function PointHistoryPage({
  pointHistory,
}: PointHistoryPageProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  };

  const getPointTypeColor = (amount: number) => {
    return amount > 0 ? 'text-emerald-500' : 'text-red-500';
  };

  const getPointTypeIcon = (amount: number) => {
    return amount > 0 ? (
      <TrendingUp className='h-5 w-5 text-emerald-500' />
    ) : (
      <TrendingDown className='h-5 w-5 text-red-500' />
    );
  };

  const totalPoints = pointHistory.reduce(
    (sum, point) => sum + point.amount,
    0,
  );

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      {/* 헤더 */}
      <header className='sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='flex h-14 items-center gap-4 px-4'>
          <button
            onClick={() => router.back()}
            className='flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary'
            aria-label='뒤로 가기'
          >
            <ArrowLeft className='h-5 w-5' />
          </button>
          <h1 className='text-lg font-semibold'>포인트 히스토리</h1>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className='flex-1 p-4'>
        {/* 총 포인트 카드 */}
        <Card className='mb-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20'>
                <Coins className='h-6 w-6 text-emerald-500' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>총 보유 포인트</p>
                <p className='text-2xl font-bold text-foreground'>
                  {totalPoints.toLocaleString()} P
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 포인트 히스토리 리스트 */}
        {pointHistory.length === 0 ? (
          <Card className='flex flex-col items-center justify-center p-12'>
            <History className='mb-4 h-12 w-12 text-muted-foreground/50' />
            <p className='text-center text-muted-foreground'>
              아직 포인트 내역이 없습니다.
            </p>
            <p className='mt-2 text-center text-sm text-muted-foreground'>
              활동을 완료하고 포인트를 획득해보세요!
            </p>
          </Card>
        ) : (
          <div className='space-y-3'>
            <h2 className='text-sm font-medium text-muted-foreground'>
              전체 내역 ({pointHistory.length})
            </h2>
            {pointHistory.map((point) => (
              <Card
                key={point.id}
                className='p-4 transition-shadow hover:shadow-md'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex flex-1 gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary'>
                      {getPointTypeIcon(point.amount)}
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-foreground'>
                        {point.description || point.type}
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {formatDate(point.createdAt)}
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        유형: {point.type}
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col items-end'>
                    <p
                      className={`text-lg font-bold ${getPointTypeColor(point.amount)}`}
                    >
                      {point.amount > 0 ? '+' : ''}
                      {point.amount.toLocaleString()}
                    </p>
                    <p className='text-xs text-muted-foreground'>포인트</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
