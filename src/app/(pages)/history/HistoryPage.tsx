'use client';

import { Card } from '@/shared/components/ui/card';
import { Clock, ArrowLeft } from 'lucide-react';
import { useAllPhases } from '@/features/PhaseForm/hooks/useAllPhases';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';

interface HistoryPageProps {
  userId: string;
}

export default function HistoryPage({ userId }: HistoryPageProps) {
  const router = useRouter();
  const { data: allPhases, isLoading } = useAllPhases(userId);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateDuration = (
    segments: { startTime: Date; endTime: Date | null }[],
  ) => {
    if (!segments || segments.length === 0) {
      return '0초';
    }

    const totalMs = segments.reduce((total, segment) => {
      if (!segment.endTime) {
        return total;
      }
      const start = new Date(segment.startTime).getTime();
      const end = new Date(segment.endTime).getTime();
      return total + (end - start);
    }, 0);

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분`;
    } else {
      return `${seconds}초`;
    }
  };

  const getTimeRange = (
    segments: { startTime: Date; endTime: Date | null }[],
  ) => {
    if (!segments || segments.length === 0) {
      return '';
    }

    const firstStart = new Date(segments[0].startTime);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment.endTime) {
      return `${formatTime(firstStart)} ~ 진행중`;
    }

    const lastEnd = new Date(lastSegment.endTime);
    return `${formatTime(firstStart)} ~ ${formatTime(lastEnd)}`;
  };

  const groupPhasesByDate = (phases: typeof allPhases) => {
    if (!phases) return {};

    const grouped = phases.reduce(
      (groups, phase) => {
        const date = formatDate(phase.startTime || phase.createdAt);
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(phase);
        return groups;
      },
      {} as Record<string, typeof phases>,
    );

    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const timeA = new Date(a.startTime || a.createdAt).getTime();
        const timeB = new Date(b.startTime || b.createdAt).getTime();
        return timeB - timeA;
      });
    });

    return grouped;
  };

  const groupedPhases = groupPhasesByDate(allPhases);

  return (
    <div className='pb-6'>
      {/* Header */}
      <div className='mb-6 flex items-center gap-3'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => router.back()}
          className='h-9 w-9'
        >
          <ArrowLeft className='h-5 w-5' />
        </Button>
      </div>
      <div className='flex-1'>
        <h1 className='text-2xl font-bold'>전체 기록</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          모든 활동 기록을 확인할 수 있습니다
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className='p-4'>
          <p className='text-sm text-muted-foreground'>로딩 중...</p>
        </Card>
      ) : !allPhases || allPhases.length === 0 ? (
        <Card className='p-4'>
          <p className='text-sm text-muted-foreground'>
            아직 기록이 없습니다. Phase를 추가해보세요!
          </p>
        </Card>
      ) : (
        <div className='space-y-4'>
          {Object.entries(groupedPhases)
            .sort(([dateA], [dateB]) => {
              const parseKoreanDate = (dateStr: string) => {
                const match = dateStr.match(/(\d+)년\s+(\d+)월\s+(\d+)일/);
                if (match) {
                  const [, year, month, day] = match;
                  return new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                  );
                }
                return new Date(dateStr);
              };
              return (
                parseKoreanDate(dateB).getTime() -
                parseKoreanDate(dateA).getTime()
              );
            })
            .map(([date, phases]) => (
              <div key={date}>
                <h3 className='mb-2 text-sm font-medium text-muted-foreground'>
                  {date}
                </h3>
                <div className='space-y-2'>
                  {phases.map((phase) => (
                    <Card
                      key={phase.id}
                      className='p-3 transition-colors hover:bg-[#1f1f1f]/50'
                    >
                      <div className='flex items-start gap-3'>
                        <div
                          className='mt-1 h-3 w-3 flex-shrink-0 rounded-full'
                          style={{ backgroundColor: phase.color || phase.category || '#6b7280' }}
                        />
                        <div className='flex-1 space-y-1'>
                          <div className='flex items-center justify-between gap-2'>
                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                              <Clock className='h-3 w-3' />
                              <span>{getTimeRange(phase.segments || [])}</span>
                            </div>
                            <span className='text-sm font-medium text-[#22c55e]'>
                              {calculateDuration(phase.segments || [])}
                            </span>
                          </div>
                          {phase.note && (
                            <p className='text-sm text-foreground'>
                              {phase.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
