'use client';

import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Award,
  TrendingUp,
  Zap,
  ChevronRight,
  Calendar,
  Timer,
  Target,
  StickyNote,
} from 'lucide-react';
import { useRecentPhases } from '@/features/PhaseForm/hooks/useRecentPhases';
import { useActivityHeatmap } from '@/features/PhaseForm/hooks/useActivityHeatmap';
import ActivityHeatmap from '@/shared/components/commons/ActivityHeatmap';
import DailyQuote from '@/shared/components/commons/DailyQuote';
import { useRouter } from 'next/navigation';
import { useGoalProgress } from '@/features/profile/goals/hooks/useGoalProgress';
import { Progress } from '@/shared/components/ui/progress';

interface HomePageProps {
  userId: string;
}

export default function HomePage({ userId }: HomePageProps) {
  const router = useRouter();
  const { data: recentPhases, isLoading } = useRecentPhases(userId, 5);
  const { data: activityData, isLoading: isLoadingActivity } =
    useActivityHeatmap(userId, 365);
  const {
    data: goalProgress,
    isLoading: isLoadingGoals,
    error: goalError,
  } = useGoalProgress();

  const formatDate = (date: Date) => {
    const targetDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 날짜만 비교하기 위해 시간 제거
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    const fullDate = new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });

    if (targetDate.getTime() === today.getTime()) {
      return `${fullDate} | 오늘`;
    }
    if (targetDate.getTime() === yesterday.getTime()) {
      return `${fullDate} | 어제`;
    }
    return fullDate;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
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
        return total; // 완료되지 않은 세그먼트는 제외
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

    // 진행 중인 경우
    if (!lastSegment.endTime) {
      return `${formatTime(firstStart)} ~ 진행중`;
    }

    const lastEnd = new Date(lastSegment.endTime);
    return `${formatTime(firstStart)} ~ ${formatTime(lastEnd)}`;
  };

  const groupPhasesByDate = (phases: typeof recentPhases) => {
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

    // 각 날짜 그룹 내에서 시간순으로 정렬 (최신순)
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const timeA = new Date(a.startTime || a.createdAt).getTime();
        const timeB = new Date(b.startTime || b.createdAt).getTime();
        return timeB - timeA; // 최신순
      });
    });

    return grouped;
  };

  const groupedPhases = groupPhasesByDate(recentPhases);

  // 오늘의 통계 계산
  const getTodayStats = () => {
    if (!recentPhases) return { sessions: 0, totalTime: '0분', goalRate: 0 };

    const today = new Date().toISOString().split('T')[0];
    const todayPhases = recentPhases.filter((phase) => {
      const phaseDate = new Date(phase.startTime || phase.createdAt)
        .toISOString()
        .split('T')[0];
      return phaseDate === today;
    });

    const sessions = todayPhases.length;

    // 총 집중 시간 계산
    const totalMs = todayPhases.reduce((total, phase) => {
      if (!phase.segments || phase.segments.length === 0) return total;

      const phaseTime = phase.segments.reduce((segTotal, segment) => {
        if (!segment.endTime) return segTotal;
        const start = new Date(segment.startTime).getTime();
        const end = new Date(segment.endTime).getTime();
        return segTotal + (end - start);
      }, 0);

      return total + phaseTime;
    }, 0);

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

    const totalTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // 목표 달성률 (임시로 세션 수 기반으로 계산, 나중에 목표 기능 추가 시 변경)
    const goalRate = Math.min(Math.round((sessions / 5) * 100), 100);

    return { sessions, totalTime, goalRate };
  };

  const todayStats = getTodayStats();

  // 연속 출석일 계산
  const getStreakDays = () => {
    if (!activityData || activityData.length === 0) return 0;

    // 날짜별로 정렬 (최신순)
    const sortedActivities = [...activityData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // 오늘 날짜 (시간 제외)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streakCount = 0;
    const currentDate = new Date(today);

    // 오늘부터 역순으로 연속된 날짜 확인
    for (let i = 0; i < sortedActivities.length; i++) {
      const activityDate = new Date(sortedActivities[i].date);
      activityDate.setHours(0, 0, 0, 0);

      // 현재 체크하는 날짜와 activity 날짜가 같으면
      if (activityDate.getTime() === currentDate.getTime()) {
        streakCount++;
        // 다음 날 체크를 위해 하루 이전으로 이동
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (activityDate.getTime() < currentDate.getTime()) {
        // 날짜가 건너뛰어졌으면 연속 중단
        break;
      }
    }

    return streakCount;
  };

  const streakDays = getStreakDays();

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}분`;
    if (mins === 0) return `${hours}시간`;
    return `${hours}시간 ${mins}분`;
  };

  return (
    <>
      <div>
        {/* Daily Quote */}
        <DailyQuote />

        {/* Goal Setting Section */}
        <div className='mt-6'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>목표 설정</h2>
            <button
              onClick={() => router.push('/profile/goals')}
              className='flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
            >
              설정하기
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
          <Card className='p-4'>
            {isLoadingGoals ? (
              <div className='flex items-center justify-center py-8'>
                <p className='text-sm text-muted-foreground'>로딩 중...</p>
              </div>
            ) : goalError ? (
              <div className='flex items-center justify-center py-8'>
                <p className='text-sm text-destructive'>
                  목표를 불러오는 중 오류가 발생했습니다
                </p>
              </div>
            ) : goalProgress ? (
              <div className='space-y-4'>
                {/* Daily Goal */}
                {goalProgress.daily.goal && (
                  <div>
                    <div className='mb-1 flex justify-between text-sm'>
                      <span className='font-medium'>일일 목표</span>
                      <span className='text-muted-foreground'>
                        {formatMinutes(goalProgress.daily.currentMinutes || 0)}{' '}
                        / {formatMinutes(goalProgress.daily.goal.targetMinutes)}
                      </span>
                    </div>
                    <Progress
                      value={goalProgress.daily.progress || 0}
                      className='h-2'
                    />
                    <div className='mt-1 text-xs text-muted-foreground'>
                      {(goalProgress.daily.progress || 0) >= 100
                        ? '✨ 목표 달성!'
                        : `${Math.round(goalProgress.daily.progress || 0)}% 달성`}
                    </div>
                  </div>
                )}

                {/* Weekly Goal */}
                {goalProgress.weekly.goal && (
                  <div>
                    <div className='mb-1 flex justify-between text-sm'>
                      <span className='font-medium'>주간 목표</span>
                      <span className='text-muted-foreground'>
                        {formatMinutes(goalProgress.weekly.currentMinutes || 0)}{' '}
                        /{' '}
                        {formatMinutes(goalProgress.weekly.goal.targetMinutes)}
                      </span>
                    </div>
                    <Progress
                      value={goalProgress.weekly.progress || 0}
                      className='h-2'
                    />
                    <div className='mt-1 text-xs text-muted-foreground'>
                      {(goalProgress.weekly.progress || 0) >= 100
                        ? '✨ 목표 달성!'
                        : `${Math.round(goalProgress.weekly.progress || 0)}% 달성`}
                    </div>
                  </div>
                )}

                {/* Monthly Goal */}
                {goalProgress.monthly.goal && (
                  <div>
                    <div className='mb-1 flex justify-between text-sm'>
                      <span className='font-medium'>월간 목표</span>
                      <span className='text-muted-foreground'>
                        {formatMinutes(
                          goalProgress.monthly.currentMinutes || 0,
                        )}{' '}
                        /{' '}
                        {formatMinutes(goalProgress.monthly.goal.targetMinutes)}
                      </span>
                    </div>
                    <Progress
                      value={goalProgress.monthly.progress || 0}
                      className='h-2'
                    />
                    <div className='mt-1 text-xs text-muted-foreground'>
                      {(goalProgress.monthly.progress || 0) >= 100
                        ? '✨ 목표 달성!'
                        : `${Math.round(goalProgress.monthly.progress || 0)}% 달성`}
                    </div>
                  </div>
                )}

                {/* No Goals Set */}
                {!goalProgress.daily.goal &&
                  !goalProgress.weekly.goal &&
                  !goalProgress.monthly.goal && (
                    <div className='flex flex-col items-center justify-center py-8 text-center'>
                      <Target className='mb-2 h-10 w-10 text-muted-foreground/50' />
                      <p className='text-sm text-muted-foreground'>
                        아직 목표가 설정되지 않았습니다
                      </p>
                      <button
                        onClick={() => router.push('/profile/goals')}
                        className='mt-2 text-sm font-medium text-[#22c55e] transition-colors hover:text-[#22c55e]/80'
                      >
                        목표 설정하러 가기
                      </button>
                    </div>
                  )}
              </div>
            ) : null}
          </Card>
        </div>

        {/* Stats Summary */}
        <div className='mt-6'>
          <h2 className='mb-3 text-lg font-semibold'>오늘의 통계</h2>
          <Card className='p-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-sm'>
                <Award className='h-4 w-4 text-[#22c55e]' />
                <span className='text-muted-foreground'>오늘의 세션</span>
                <span className='ml-auto font-medium'>
                  {todayStats.sessions}회
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Zap className='h-4 w-4 text-[#22c55e]' />
                <span className='text-muted-foreground'>총 집중 시간</span>
                <span className='ml-auto font-medium'>
                  {todayStats.totalTime}
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Calendar className='h-4 w-4 text-[#22c55e]' />
                <span className='text-muted-foreground'>연속 출석일</span>
                <span className='ml-auto font-medium text-[#22c55e]'>
                  {streakDays}일
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <TrendingUp className='h-4 w-4 text-[#22c55e]' />
                <span className='text-muted-foreground'>목표 달성률</span>
                <span className='ml-auto font-medium text-[#22c55e]'>
                  {todayStats.goalRate}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Heatmap */}
        <div className='mt-6'>
          <h2 className='mb-3 text-lg font-semibold'>출석 체크</h2>
          <Card className='p-4'>
            {isLoadingActivity ? (
              <div className='flex h-32 items-center justify-center'>
                <p className='text-sm text-muted-foreground'>로딩 중...</p>
              </div>
            ) : activityData && activityData.length > 0 ? (
              <ActivityHeatmap activities={activityData} weeks={52} />
            ) : (
              <div className='flex h-32 items-center justify-center'>
                <p className='text-sm text-muted-foreground'>
                  아직 활동 기록이 없습니다.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* 최근 기록 목록 */}
        <div className='mt-6'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>최근 기록 목록</h2>
            {recentPhases && recentPhases.length > 0 && (
              <button
                onClick={() => router.push('/history')}
                className='flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'
              >
                기록 관리
                <ChevronRight className='h-4 w-4' />
              </button>
            )}
          </div>
          {isLoading ? (
            <Card className='p-4'>
              <p className='text-sm text-muted-foreground'>로딩 중...</p>
            </Card>
          ) : !recentPhases || recentPhases.length === 0 ? (
            <Card className='p-4'>
              <p className='text-sm text-muted-foreground'>
                최근 기록이 없습니다. Phase를 추가해보세요!
              </p>
            </Card>
          ) : (
            <div className='space-y-4'>
              {Object.entries(groupedPhases)
                .sort(([dateA], [dateB]) => {
                  // 날짜 문자열을 Date 객체로 변환하여 비교 (최신순)
                  const parseKoreanDate = (dateStr: string) => {
                    // "2026년 1월 12일 (일)" 형식을 파싱
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
                          className='group rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50'
                        >
                          <div className='flex items-start justify-between gap-4'>
                            <div className='min-w-0 flex-1 space-y-2'>
                              {/* 1행: 제목 배지 */}
                              <div className='flex items-center gap-2'>
                                <Badge
                                  variant='secondary'
                                  className='shrink-0'
                                  style={{
                                    backgroundColor:
                                      (phase.color ||
                                        phase.category ||
                                        '#6b7280') + '20',
                                    color:
                                      phase.color ||
                                      phase.category ||
                                      '#6b7280',
                                    borderColor:
                                      (phase.color ||
                                        phase.category ||
                                        '#6b7280') + '40',
                                  }}
                                >
                                  {phase.title || phase.note}
                                </Badge>
                              </div>

                              {/* 2행: 메모 */}
                              {phase.note && phase.title && (
                                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                  <StickyNote className='h-4 w-4' />
                                  <span>{phase.note}</span>
                                </div>
                              )}

                              {/* 3행: 시작시간-종료시간 */}
                              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                <Timer className='h-4 w-4' />
                                <span>
                                  {getTimeRange(phase.segments || [])}
                                </span>
                              </div>
                            </div>

                            {/* 우측: 사용시간 */}
                            <div className='flex-shrink-0'>
                              <div className='text-right'>
                                <div className='text-sm font-medium text-[#22c55e]'>
                                  {calculateDuration(phase.segments || [])}
                                </div>
                              </div>
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
      </div>
    </>
  );
}
