'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Play, Pause, X, Flag, Square } from 'lucide-react';
import PhaseComplete from '@/features/timerlist/PhaseComplete';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';

interface TimerProps {
  userId: string;
  initialTime?: number;
  goalTitle?: string;
  color?: string;
  onClose?: () => void;
}

export default function Timer({
  userId,
  initialTime = 10,
  goalTitle = '타이머',
  color = '#22c55e',
  onClose,
}: TimerProps) {
  const [time, setTime] = useState(initialTime);
  const [remainingTime, setRemainingTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [completedTime, setCompletedTime] = useState(0);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 초기 시간 설정
  useEffect(() => {
    setTime(initialTime);
    setRemainingTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setCompletedTime(time);
            setShowComplete(true);
            return 0;
          }
          return prev - 1;
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
  }, [isRunning, remainingTime, time]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingTime(time);
  };

  const handleSetTime = (seconds: number) => {
    setTime(seconds);
    setRemainingTime(seconds);
    setIsRunning(false);
  };

  const handleCompleteConfirm = () => {
    setShowComplete(false);
    setRemainingTime(time);
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

  const parseTimeInput = (input: string): number => {
    // 숫자가 아닌 문자 제거
    const numericInput = input.replace(/\D/g, '');
    if (!numericInput) return 0;

    const len = numericInput.length;

    // 1-2자리: 분으로 해석
    if (len <= 2) {
      const minutes = parseInt(numericInput, 10);
      return minutes * 60;
    }
    // 3-4자리: 마지막 2자리는 초, 나머지는 분
    else if (len <= 4) {
      const minutes = parseInt(numericInput.slice(0, -2), 10);
      const seconds = parseInt(numericInput.slice(-2), 10);
      return minutes * 60 + seconds;
    }
    // 5-6자리: 마지막 2자리는 초, 중간 2자리는 분, 나머지는 시간
    else {
      const hours = parseInt(numericInput.slice(0, -4), 10);
      const minutes = parseInt(numericInput.slice(-4, -2), 10);
      const seconds = parseInt(numericInput.slice(-2), 10);
      return hours * 3600 + minutes * 60 + seconds;
    }
  };

  /**
   * 시간 편집 모드 활성화
   */
  const handleTimeClick = () => {
    if (isRunning) return; // 타이머 실행 중에는 수정 불가
    setIsEditingTime(true);
    setTimeInput('');
  };

  /**
   * 입력된 숫자를 실시간으로 시간 형식으로 표시
   */
  const formatInputAsTime = (input: string): string => {
    const numericInput = input.replace(/\D/g, '');
    if (!numericInput) return '';

    const len = numericInput.length;

    // 1-2자리: MM (분)
    if (len <= 2) {
      return numericInput;
    }
    // 3-4자리: MM:SS (분:초)
    else if (len <= 4) {
      const minutes = numericInput.slice(0, -2);
      const seconds = numericInput.slice(-2);
      return `${minutes}:${seconds}`;
    }
    // 5-6자리: HH:MM:SS (시:분:초)
    else {
      const hours = numericInput.slice(0, -4);
      const minutes = numericInput.slice(-4, -2);
      const seconds = numericInput.slice(-2);
      return `${hours}:${minutes}:${seconds}`;
    }
  };

  /**
   * 시간 입력 처리
   */
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 숫자만 허용
    setTimeInput(value);
  };

  /**
   * 시간 입력 완료 (Enter 또는 blur)
   */
  const handleTimeInputSubmit = () => {
    if (!timeInput) {
      setIsEditingTime(false);
      return;
    }

    const seconds = parseTimeInput(timeInput);
    if (seconds > 0) {
      handleSetTime(seconds);
    }
    setIsEditingTime(false);
    setTimeInput('');
  };

  /**
   * Enter 키 처리
   */
  const handleTimeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTimeInputSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTime(false);
      setTimeInput('');
    }
  };

  // 편집 모드 활성화 시 input에 focus
  useEffect(() => {
    if (isEditingTime && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingTime]);

  const progress = ((time - remainingTime) / time) * 100;

  return (
    <>
      {/* 타이머 완료 Dialog - X 버튼 숨김 */}
      <Dialog
        open={showComplete}
        onOpenChange={(open) => {
          // 타이머 완료 시에는 Dialog를 임의로 닫지 못하게 함
          if (!open) return;
          setShowComplete(open);
        }}
      >
        <DialogContent className='overflow-w-hidden max-h-[95vh] max-w-[90vw] border-[#1f1f1f] sm:max-w-md [&>button]:hidden'>
          <DialogTitle className='sr-only'>타이머 완료</DialogTitle>
          <DialogDescription className='sr-only'>
            목표 시간을 달성했습니다. 세션을 저장하세요.
          </DialogDescription>
          <PhaseComplete
            completedTime={completedTime}
            onConfirm={handleCompleteConfirm}
            userId={userId}
            color={color}
          />
        </DialogContent>
      </Dialog>

      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold'>{goalTitle}</h2>
          {onClose && (
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-8 w-8'
            >
              <X className='h-5 w-5' />
            </Button>
          )}
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
                stroke={color}
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
                {isEditingTime ? (
                  <input
                    ref={inputRef}
                    type='text'
                    inputMode='numeric'
                    value={formatInputAsTime(timeInput)}
                    onChange={handleTimeInputChange}
                    onBlur={handleTimeInputSubmit}
                    onKeyDown={handleTimeInputKeyDown}
                    placeholder='00:00'
                    className='mb-1 w-[240px] bg-transparent text-center text-5xl font-bold tabular-nums outline-none'
                    style={{ minWidth: '240px', maxWidth: '240px' }}
                    data-testid='timer-time-input'
                  />
                ) : (
                  <div
                    className='mb-1 cursor-pointer text-5xl font-bold tabular-nums transition-colors hover:text-[#22c55e]'
                    onClick={handleTimeClick}
                    data-testid='timer-time-display'
                  >
                    {formatTime(remainingTime)}
                  </div>
                )}
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
                onClick={handleReset}
                className='h-14 w-14 rounded-full border-[#1f1f1f] hover:bg-[#1f1f1f]'
              >
                <X className='h-6 w-6' />
              </Button>
              <span className='text-xs'>reset</span>
            </div>
          )}

          <Button
            size='icon'
            onClick={isRunning ? handlePause : handleStart}
            className='h-20 w-20 rounded-full text-black'
            style={{ backgroundColor: color }}
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
                onClick={handleReset}
                className='h-14 w-14 rounded-full border-[#1f1f1f] hover:bg-[#1f1f1f]'
              >
                <Square className='h-6 w-6' />
              </Button>
              <span className='text-xs'>stop</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
