'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Play, Pause, X, Flag, Save } from 'lucide-react';
import { useStartPhase } from '@/features/PhaseForm/hooks/useStartPhase';
import { useUpdatePhaseStatus } from '@/features/PhaseForm/hooks/useUpdatePhaseStatus';
import { useDeletePhase } from '@/features/PhaseForm/hooks/useDeletePhase';
import { useGetPhaseById } from '@/features/PhaseForm/hooks/useGetPhaseById';
import { completePhaseAction } from '@/features/PhaseForm/actions/completePhase.action';
import { toast } from 'sonner';

interface TimerProps {
  userId: string;
  initialTime?: number;
  goalTitle?: string;
  color?: string;
  onClose?: () => void;
  autoStart?: boolean;
  phaseId?: string | null; // 이미 생성된 Phase ID
  templateId?: string; // ActivityTemplate ID (Phase 생성용)
}

export function Timer({
  userId,
  initialTime = 10,
  goalTitle = '타이머',
  color = '#22c55e',
  onClose,
  autoStart = false,
  phaseId = null,
  templateId,
}: TimerProps) {
  const router = useRouter();
  const [time, setTime] = useState(initialTime);
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseId, setCurrentPhaseId] = useState<string | null>(phaseId);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { mutate: startPhase } = useStartPhase();
  const { mutate: updatePhaseStatus } = useUpdatePhaseStatus();
  const { mutate: deletePhase } = useDeletePhase();
  // 🔄 폴링 활성화: Phase가 있으면 5초마다 서버에서 최신 데이터 조회 (보정용)
  const { data: phaseData } = useGetPhaseById(currentPhaseId, !!currentPhaseId);

  // 🚀 낙관적 업데이트 적용으로 로딩 상태 불필요
  // UI는 즉시 반응하고 서버 요청은 백그라운드에서 처리

  // 초기 시간 설정
  useEffect(() => {
    setTime(initialTime);
    setRemainingTime(initialTime);
  }, [initialTime]);

  // 🔄 서버 폴링: phaseData가 업데이트될 때마다 서버 시간으로 보정 (5초마다)
  useEffect(() => {
    if (!phaseData) return;

    const now = new Date();
    let totalElapsedSeconds = 0;

    // Segment 기준으로 경과 시간 계산 (일시정지 구간 제외)
    if (phaseData.segments && phaseData.segments.length > 0) {
      for (const segment of phaseData.segments) {
        const segmentStart = new Date(segment.startTime);
        const segmentEnd = segment.endTime ? new Date(segment.endTime) : now;
        const segmentDuration = Math.floor(
          (segmentEnd.getTime() - segmentStart.getTime()) / 1000,
        );
        totalElapsedSeconds += segmentDuration;
      }
    }

    // 남은 시간 계산 (서버 기준 정확한 시간)
    const remaining = Math.max(0, initialTime - totalElapsedSeconds);
    setRemainingTime(remaining); // 5초마다 서버 시간으로 보정

    // 상태에 따라 isRunning 설정
    if (phaseData.status === 'STARTED') {
      setIsRunning(true);
    } else if (phaseData.status === 'PAUSED') {
      setIsRunning(false);
    }
  }, [phaseData, initialTime]);

  // ⏱️ 클라이언트 setInterval: 1초마다 UI 부드럽게 업데이트
  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // 타이머 완료 시 Phase 자동 완료 처리
            if (currentPhaseId) {
              completePhaseAction({ phaseId: currentPhaseId })
                .then(() => {
                  router.push(
                    `/timer/phase-complete?completedTime=${time}&color=${encodeURIComponent(color)}&phaseId=${currentPhaseId}&category=${encodeURIComponent(goalTitle)}`,
                  );
                })
                .catch(() => {
                  router.push(
                    `/timer/phase-complete?completedTime=${time}&color=${encodeURIComponent(color)}&phaseId=${currentPhaseId}&category=${encodeURIComponent(goalTitle)}`,
                  );
                });
            }
            return 0;
          }
          return prev - 1; // 1초마다 -1 (부드러운 카운트다운)
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isRunning,
    remainingTime,
    currentPhaseId,
    time,
    color,
    goalTitle,
    router,
  ]);

  // autoStart가 true이면 자동으로 타이머 시작
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // autoStart가 true이고 아직 시작하지 않았으면 즉시 시작
    if (autoStart && !hasStartedRef.current) {
      hasStartedRef.current = true;

      // phaseId가 이미 있으면 바로 시작 (Phase는 이미 생성됨)
      if (phaseId) {
        // Phase는 이미 STARTED 상태로 생성되었으므로 타이머만 시작
        setCurrentPhaseId(phaseId);
        setIsRunning(true);
      } else {
        // Phase 없이 타이머만 시작
        setIsRunning(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, phaseId]);

  // 🚀 setInterval 제거: 폴링 방식으로 서버에서 5초마다 정확한 시간 조회

  const handleStart = () => {
    // Phase가 아직 생성되지 않았다면 생성
    if (!currentPhaseId && templateId) {
      // 🚀 낙관적 업데이트: 즉시 타이머 시작
      setIsRunning(true);

      startPhase(
        {
          userId,
          templateId,
        },
        {
          onSuccess: (data) => {
            setCurrentPhaseId(data.id);
            // 타이머는 이미 시작됨
          },
          onError: () => {
            // 🔴 실패 시에도 타이머는 계속 동작 (Phase 없이 사용 가능)
            // 사용자에게 경고 표시 가능
          },
        },
      );
    } else if (currentPhaseId) {
      // 🚀 낙관적 업데이트: 재시작 즉시 반영
      setIsRunning(true);

      // 재시작 시 STARTED로 상태 업데이트
      updatePhaseStatus(
        {
          phaseId: currentPhaseId,
          status: 'STARTED',
        },
        {
          onSuccess: () => {
            // 타이머는 이미 시작됨, 추가 작업 없음
          },
          onError: () => {
            // 🔴 실패 시 타이머 중지 및 사용자에게 알림
            setIsRunning(false);
            toast.error('타이머 시작에 실패했습니다. 다시 시도해주세요.');
          },
        },
      );
    }
  };

  const handlePause = () => {
    // 🚀 낙관적 업데이트: 즉시 타이머 일시정지
    setIsRunning(false);

    // Phase가 존재하면 PAUSED로 상태 업데이트
    if (currentPhaseId) {
      updatePhaseStatus(
        {
          phaseId: currentPhaseId,
          status: 'PAUSED',
        },
        {
          onSuccess: () => {
            // 타이머는 이미 정지됨, 추가 작업 없음
          },
          onError: () => {
            // 🔴 실패 시 타이머 재시작 및 사용자에게 알림
            setIsRunning(true);
            toast.error('일시정지에 실패했습니다. 다시 시도해주세요.');
          },
        },
      );
    }
  };

  const handleCancel = () => {
    if (currentPhaseId) {
      // Phase 삭제
      deletePhase(
        { phaseId: currentPhaseId },
        {
          onSuccess: () => {
            setIsRunning(false);
            setCurrentPhaseId(null);
            if (onClose) {
              onClose();
            }
          },
          onError: () => {},
        },
      );
    } else {
      // Phase 없이 타이머만 실행 중인 경우
      setIsRunning(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleSave = () => {
    if (currentPhaseId) {
      // 현재까지의 기록을 저장하고 완료 처리
      completePhaseAction({ phaseId: currentPhaseId })
        .then(() => {
          router.push(
            `/timer/phase-complete?completedTime=${time - remainingTime}&color=${encodeURIComponent(color)}&phaseId=${currentPhaseId}&category=${encodeURIComponent(goalTitle)}`,
          );
        })
        .catch(() => {});
    } else {
      // Phase 없이 타이머만 실행 중인 경우
      setIsRunning(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatSegmentTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const calculateSegmentDuration = (startTime: Date, endTime: Date | null) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const durationSeconds = Math.floor((end - start) / 1000);
    return formatTime(durationSeconds);
  };

  const progress = ((time - remainingTime) / time) * 100;

  return (
    <div className='h-screen w-full max-w-md space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div
            className='h-4 w-4 rounded-full'
            style={{ backgroundColor: color }}
          />
          <h2 className='text-xl font-bold'>{goalTitle}</h2>
        </div>
        {/* {onClose && (
          <Button
            variant='ghost'
            size='icon'
            onClick={handleClose}
            className='h-8 w-8'
          >
            <X className='h-5 w-5' />
          </Button>
        )} */}
      </div>

      {/* Circular Timer */}
      <div className='flex flex-col items-center justify-center py-6'>
        <div className='relative h-64 w-64'>
          {/* Background Circle */}
          <svg
            className='h-full w-full -rotate-90 transform'
            viewBox='0 0 100 100'
          >
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='#1f1f1f'
              strokeWidth='4'
            />
            {/* Progress Circle */}
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='#22c55e'
              strokeWidth='4'
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap='round'
              className='transition-all duration-1000'
            />
          </svg>

          {/* Time Display */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <div className='flex items-center justify-center rounded-full border bg-foreground/20 px-1'>
                <div className='flex w-fit items-center justify-center gap-1 text-sm text-muted-foreground'>
                  {isRunning ? (
                    <>
                      <Flag className='h-4 w-4' />
                      목표: {formatTime(time)}
                    </>
                  ) : remainingTime === time ? (
                    '시작 대기'
                  ) : (
                    '일시정지'
                  )}
                </div>
              </div>
              <div
                className='mb-1 text-5xl font-bold tabular-nums'
                data-testid='timer-time-display'
              >
                {formatTime(remainingTime)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className='flex items-center justify-center gap-4'>
        {remainingTime !== time && (
          <div className='flex flex-col items-center gap-1'>
            <Button
              variant='outline'
              size='icon'
              onClick={handleCancel}
              className='h-14 w-14 rounded-full hover:bg-[#1f1f1f]'
            >
              <X className='h-6 w-6' />
            </Button>
            <span className='text-xs'>cancel</span>
          </div>
        )}

        <Button
          size='icon'
          onClick={isRunning ? handlePause : handleStart}
          className='h-20 w-20 rounded-full bg-[#22c55e] text-black hover:bg-[#22c55e]/90'
        >
          {isRunning ? (
            <Pause className='h-8 w-8' fill='currentColor' />
          ) : (
            <Play className='h-8 w-8' fill='currentColor' />
          )}
        </Button>

        {remainingTime !== time && (
          <div className='flex flex-col items-center gap-1'>
            <Button
              variant='outline'
              size='icon'
              onClick={handleSave}
              className='h-14 w-14 rounded-full hover:bg-[#1f1f1f]'
            >
              <Save className='h-6 w-6' />
            </Button>
            <span className='text-xs'>save</span>
          </div>
        )}
      </div>

      {/* Segment List */}
      {currentPhaseId &&
        phaseData?.segments &&
        phaseData.segments.length > 0 && (
          <div className='mt-6 space-y-2'>
            <h3 className='text-sm font-semibold text-muted-foreground'>
              활동 기록
            </h3>
            <div className='space-y-2'>
              {phaseData.segments.map((segment, index) => (
                <div
                  key={segment.id}
                  className='flex items-center justify-between rounded-lg border bg-background/50 px-4 py-2'
                >
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      #{index + 1}
                    </span>
                    <span className='whitespace-nowrap text-sm'>
                      {formatSegmentTime(segment.startTime)},{' '}
                      {segment.endTime
                        ? formatSegmentTime(segment.endTime)
                        : '진행 중'}
                    </span>
                  </div>
                  <span className='whitespace-nowrap text-sm font-semibold text-[#22c55e]'>
                    {calculateSegmentDuration(
                      segment.startTime,
                      segment.endTime,
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
