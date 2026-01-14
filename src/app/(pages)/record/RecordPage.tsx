'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import CustomModal from '@/shared/components/commons/CustomModal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Timer,
  StickyNote,
} from 'lucide-react';
import { useDailyPhases } from '@/features/PhaseForm/hooks/useDailyPhases';
import {
  useCreatePostPhase,
  useCreatePostPhaseWithTime,
} from '@/features/PhaseForm/hooks/useCreatePostPhase';
import { useTimerTemplates } from '@/features/timerlist/hooks/useActivityTemplates';
import { toast } from 'sonner';
import { PhaseAddBtn } from '@/features/Phase';
import PhaseForm from '@/features/PhaseForm';

interface RecordPageProps {
  userId: string;
}

interface TimeGap {
  startTime: Date;
  endTime: Date;
  label: string;
}

export default function RecordPage({ userId }: RecordPageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showGapModal, setShowGapModal] = useState(false);
  const [selectedGap, setSelectedGap] = useState<TimeGap | null>(null);
  const [showPhaseForm, setShowPhaseForm] = useState(false);

  const { data: phases, isLoading } = useDailyPhases(userId, selectedDate);
  const { data: templates } = useTimerTemplates(userId);
  const createPostPhaseMutation = useCreatePostPhase(userId);
  const createPostPhaseWithTimeMutation = useCreatePostPhaseWithTime(userId);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const fullDate = date.toLocaleDateString('ko-KR', {
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

  const calculateDuration = (startTime: Date, endTime: Date) => {
    const ms = new Date(endTime).getTime() - new Date(startTime).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else {
      return `${minutes}분`;
    }
  };

  // 빈 시간대 계산 (정각 단위로 끊기, 최대 1시간씩) - useMemo로 최적화 및 자동 재계산
  const gaps = useMemo((): TimeGap[] => {
    if (!phases || phases.length === 0) return [];

    const gaps: TimeGap[] = [];
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Phase들을 시간순으로 정렬
    const sortedPhases = [...phases].sort(
      (a, b) =>
        new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime(),
    );

    let currentTime = dayStart;

    sortedPhases.forEach((phase) => {
      const phaseStart = new Date(phase.startTime!);
      const phaseEnd = new Date(phase.endTime!);

      // 현재 시간과 Phase 시작 사이에 gap이 있는 경우
      if (currentTime < phaseStart) {
        let gapStart = new Date(currentTime);

        while (gapStart < phaseStart) {
          // 다음 정각 계산
          const nextHour = new Date(gapStart);
          nextHour.setMinutes(0, 0, 0);
          nextHour.setHours(nextHour.getHours() + 1);

          // gapEnd는 다음 정각과 phaseStart 중 더 빠른 시간
          const gapEnd = nextHour < phaseStart ? nextHour : phaseStart;

          // 시간이 같지 않으면 gap 추가
          if (gapStart.getTime() !== gapEnd.getTime()) {
            gaps.push({
              startTime: new Date(gapStart),
              endTime: new Date(gapEnd),
              label: `${formatTime(gapStart)} ~ ${formatTime(gapEnd)}`,
            });
          }

          gapStart = gapEnd;
        }
      }

      currentTime = phaseEnd;
    });

    // 마지막 Phase 이후부터 자정까지
    if (currentTime < dayEnd) {
      let gapStart = new Date(currentTime);

      while (gapStart < dayEnd) {
        // 다음 정각 계산
        const nextHour = new Date(gapStart);
        nextHour.setMinutes(0, 0, 0);
        nextHour.setHours(nextHour.getHours() + 1);

        // gapEnd는 다음 정각과 dayEnd 중 더 빠른 시간
        const gapEnd = nextHour < dayEnd ? nextHour : dayEnd;

        // 시간이 같지 않으면 gap 추가
        if (gapStart.getTime() !== gapEnd.getTime()) {
          gaps.push({
            startTime: new Date(gapStart),
            endTime: new Date(gapEnd),
            label: `${formatTime(gapStart)} ~ ${formatTime(gapEnd)}`,
          });
        }

        gapStart = gapEnd;
      }
    }

    return gaps;
  }, [phases, selectedDate]);

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleTodoClick = async (templateId: string) => {
    const now = new Date();

    if (
      confirm(
        `지금 시간(${formatTime(now)})을 기준으로 사후 기록을 추가하시겠습니까?`,
      )
    ) {
      try {
        await createPostPhaseMutation.mutateAsync({
          templateId,
          endTime: now,
        });
        toast.success('사후 기록이 추가되었습니다');
        setShowTodoModal(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : '사후 기록 추가 실패',
        );
      }
    }
  };

  const handleGapFill = async (templateId: string) => {
    if (!selectedGap) return;

    try {
      await createPostPhaseWithTimeMutation.mutateAsync({
        templateId,
        startTime: selectedGap.startTime,
        endTime: selectedGap.endTime,
      });
      toast.success('기록이 추가되었습니다');
      setShowGapModal(false);
      setSelectedGap(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '기록 추가 실패');
    }
  };

  return (
    <>
      <div className='pb-20'>
        {/* Header */}
        {/* <div className='flex items-center justify-between'> */}
        <div className='sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <div className='flex items-center justify-between p-4'>
            <button
              onClick={handlePreviousDay}
              className='rounded-lg p-2 hover:bg-accent'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
            <h1 className='text-lg font-semibold'>
              {formatDate(selectedDate)}
            </h1>
            <button
              onClick={handleNextDay}
              className='rounded-lg p-2 hover:bg-accent'
            >
              <ChevronRight className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Todo 버튼 */}
        <div className='px-4 pb-4'>
          <Button
            onClick={() => setShowTodoModal(true)}
            className='w-full bg-[#22c55e] hover:bg-[#22c55e]/90'
          >
            <CheckCircle2 className='mr-2 h-5 w-5' />
            Todo (사후 기록 추가)
          </Button>
        </div>

        {/* 기록 목록 */}
        <div className='space-y-2 px-4'>
          {isLoading ? (
            <Card className='p-4'>
              <p className='text-sm text-muted-foreground'>로딩 중...</p>
            </Card>
          ) : !phases || phases.length === 0 ? (
            <Card className='p-4'>
              <p className='text-sm text-muted-foreground'>
                이 날짜에 기록이 없습니다
              </p>
            </Card>
          ) : (
            <>
              {/* Phase가 없으면 모든 gap 표시 */}
              {phases.length === 0 ? (
                gaps.map((gap, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedGap(gap);
                      setShowGapModal(true);
                    }}
                    className='mb-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-3 text-sm text-muted-foreground transition-colors hover:border-[#22c55e] hover:bg-accent hover:text-[#22c55e]'
                  >
                    <Plus className='h-4 w-4' />
                    <span>{gap.label}</span>
                  </button>
                ))
              ) : (
                <>
                  {phases.map((phase, phaseIndex) => {
                    const phaseStart = new Date(phase.startTime!);
                    const phaseEnd = new Date(phase.endTime!);

                    // 현재 Phase 이전의 gaps 찾기
                    const beforeGaps = gaps.filter((gap) => {
                      const gapEnd = gap.endTime.getTime();
                      const prevPhaseEnd =
                        phaseIndex > 0
                          ? new Date(phases[phaseIndex - 1].endTime!).getTime()
                          : 0;
                      return (
                        gapEnd <= phaseStart.getTime() &&
                        gap.startTime.getTime() >= prevPhaseEnd
                      );
                    });

                    // 현재 Phase 이후의 gaps 찾기 (마지막 Phase인 경우만)
                    const afterGaps =
                      phaseIndex === phases.length - 1
                        ? gaps.filter(
                            (gap) =>
                              gap.startTime.getTime() >= phaseEnd.getTime(),
                          )
                        : [];

                    return (
                      <div key={phase.id}>
                        {/* Phase 이전의 Gap 버튼들 */}
                        {beforeGaps.map((gap, gapIndex) => (
                          <button
                            key={`before-${phaseIndex}-${gapIndex}`}
                            onClick={() => {
                              setSelectedGap(gap);
                              setShowGapModal(true);
                            }}
                            className='mb-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-3 text-sm text-muted-foreground transition-colors hover:border-[#22c55e] hover:bg-accent hover:text-[#22c55e]'
                          >
                            <Plus className='h-4 w-4' />
                            <span>{gap.label}</span>
                          </button>
                        ))}

                        {/* Phase 카드 */}
                        <Card className='mb-2 p-4'>
                          <div className='flex items-start justify-between gap-4'>
                            <div className='min-w-0 flex-1 space-y-2'>
                              {/* 제목 배지 */}
                              <div className='flex items-center gap-2'>
                                <Badge
                                  variant='secondary'
                                  className='shrink-0'
                                  style={{
                                    backgroundColor:
                                      (phase.color || '#6b7280') + '20',
                                    color: phase.color || '#6b7280',
                                    borderColor:
                                      (phase.color || '#6b7280') + '40',
                                  }}
                                >
                                  {phase.title || phase.note}
                                </Badge>
                              </div>

                              {/* 메모 */}
                              {phase.note && phase.title && (
                                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                  <StickyNote className='h-4 w-4' />
                                  <span>{phase.note}</span>
                                </div>
                              )}

                              {/* 시간 */}
                              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                <Clock className='h-4 w-4' />
                                <span>
                                  {formatTime(phaseStart)} ~{' '}
                                  {formatTime(phaseEnd)}
                                </span>
                              </div>
                            </div>

                            {/* 소요 시간 */}
                            <div className='flex-shrink-0'>
                              <div className='text-sm font-medium text-[#22c55e]'>
                                {calculateDuration(phaseStart, phaseEnd)}
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Phase 이후의 Gap 버튼들 (마지막 Phase인 경우) */}
                        {afterGaps.map((gap, gapIndex) => (
                          <button
                            key={`after-${phaseIndex}-${gapIndex}`}
                            onClick={() => {
                              setSelectedGap(gap);
                              setShowGapModal(true);
                            }}
                            className='mb-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-3 text-sm text-muted-foreground transition-colors hover:border-[#22c55e] hover:bg-accent hover:text-[#22c55e]'
                          >
                            <Plus className='h-4 w-4' />
                            <span>{gap.label}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Todo 모달 */}
      <CustomModal isOpen={showTodoModal}>
        <div className='max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-background p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-xl font-bold'>Todo 선택</h2>
            <button
              onClick={() => setShowTodoModal(false)}
              className='rounded-lg p-2 hover:bg-accent'
            >
              ✕
            </button>
          </div>
          <p className='mb-4 text-sm text-muted-foreground'>
            지금 시간을 기준으로 설정된 시간만큼 이전 시간을 기록합니다
          </p>
          <div className='space-y-2'>
            {templates?.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTodoClick(template.id)}
                className='flex w-full flex-col items-start gap-2 rounded-lg border p-4 transition-colors hover:bg-accent'
                disabled={createPostPhaseMutation.isPending}
              >
                <div className='flex w-full items-center justify-between'>
                  <Badge
                    variant='secondary'
                    style={{
                      backgroundColor: template.color + '20',
                      color: template.color,
                      borderColor: template.color + '40',
                    }}
                  >
                    {template.title}
                  </Badge>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Timer className='h-4 w-4' />
                    <span>{Math.floor(template.defaultTime / 60)}분</span>
                  </div>
                </div>
                {template.note && (
                  <div className='text-sm text-muted-foreground'>
                    {template.note}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </CustomModal>

      {/* Gap 채우기 모달 */}
      <CustomModal isOpen={showGapModal}>
        <div className='max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-background p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-xl font-bold'>기록 추가</h2>
            <button
              onClick={() => {
                setShowGapModal(false);
                setSelectedGap(null);
              }}
              className='rounded-lg p-2 hover:bg-accent'
            >
              ✕
            </button>
          </div>
          {selectedGap && (
            <p className='mb-4 text-sm text-muted-foreground'>
              {selectedGap.label} 시간대에 기록을 추가합니다
            </p>
          )}
          <div className='space-y-2'>
            {templates?.map((template) => (
              <button
                key={template.id}
                onClick={() => handleGapFill(template.id)}
                className='flex w-full flex-col items-start gap-2 rounded-lg border p-4 transition-colors hover:bg-accent'
                disabled={createPostPhaseWithTimeMutation.isPending}
              >
                <Badge
                  variant='secondary'
                  style={{
                    backgroundColor: template.color + '20',
                    color: template.color,
                    borderColor: template.color + '40',
                  }}
                >
                  {template.title}
                </Badge>
                {template.note && (
                  <div className='text-sm text-muted-foreground'>
                    {template.note}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </CustomModal>
      {/* Phase Add Button */}
      <PhaseAddBtn onClick={() => setShowPhaseForm(true)} />

      {/* Phase Form Modal */}
      <CustomModal isOpen={showPhaseForm}>
        <div className='max-h-[90vh] overflow-y-auto rounded-2xl bg-background sm:max-w-md'>
          <PhaseForm onClose={() => setShowPhaseForm(false)} userId={userId} />
        </div>
      </CustomModal>
    </>
  );
}
