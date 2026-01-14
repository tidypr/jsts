'use client';

import { useState } from 'react';
import CustomModal from '@/shared/components/commons/CustomModal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { GoalPreset } from './index';
import { Badge } from '@/shared/components/ui/badge';

interface AddTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (preset: Omit<GoalPreset, 'id'>) => void;
}

const COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange-600
];

export default function AddTimerDialog({
  open,
  onOpenChange,
  onAdd,
}: AddTimerDialogProps) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('25');
  const [seconds, setSeconds] = useState('0');
  const [useInTimer, setUseInTimer] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds =
      parseInt(hours || '0') * 3600 +
      parseInt(minutes || '0') * 60 +
      parseInt(seconds || '0');

    if (!title.trim() || totalSeconds <= 0) {
      return;
    }

    const newPreset = {
      title: title.trim(),
      note: note.trim() || undefined,
      color,
      defaultTime: totalSeconds,
      useInTimer,
    };

    onAdd(newPreset);

    // Reset form
    setTitle('');
    setNote('');

    setColor(COLORS[0]);
    setHours('0');
    setMinutes('25');
    setSeconds('0');
    setUseInTimer(true);
  };

  return (
    <CustomModal isOpen={open}>
      <div className='overflow-hidden rounded-2xl bg-background sm:max-w-lg'>
        <h2 className='mb-4 text-xl font-semibold'>새 타이머 추가</h2>
        <h3 className='mb-4 text-lg font-semibold'>미리보기</h3>
        <div className='flex items-center gap-2 rounded-lg bg-muted p-3'>
          {/* <div className='flex-1'> */}
          <Badge
            className='mb-1 flex h-6 w-fit items-center justify-center rounded-lg text-sm'
            style={{ backgroundColor: color + '20', color: color }}
          >
            {title || '제목 없음'}
          </Badge>{' '}
          {note && <div className='text-xs text-muted-foreground'>{note}</div>}
          {/* </div> */}
        </div>
        <form
          onSubmit={handleSubmit}
          // className=''
          className='flex max-h-[calc(90vh-8rem)] flex-col gap-4 space-y-4 overflow-y-auto p-2'
        >
          {/* <div className='pr-2'> */}
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title'>항목</Label>
            <Input
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='예: 수학 문제 풀이'
              className='bg-muted'
            />
          </div>

          {/* Note */}
          <div className='space-y-2'>
            <Label htmlFor='note'>메모 (선택사항)</Label>
            <Input
              id='note'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='예: 미적분 1장 문제 풀기'
              className='bg-muted'
            />
          </div>

          {/* Color */}
          <div className='space-y-2'>
            <Label>색상</Label>
            <div className='flex gap-2'>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type='button'
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    color === c
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black'
                      : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Time */}
          <div className='space-y-2'>
            <Label>시간</Label>
            <div className='flex gap-2'>
              <div className='flex-1'>
                <Input
                  type='number'
                  min='0'
                  max='23'
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder='시'
                  className='bg-muted'
                />
              </div>
              <div className='flex-1'>
                <Input
                  type='number'
                  min='0'
                  max='59'
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder='분'
                  className='bg-muted'
                />
              </div>
              <div className='flex-1'>
                <Input
                  type='number'
                  min='0'
                  max='59'
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  placeholder='초'
                  className='bg-muted'
                />
              </div>
            </div>
          </div>

          {/* Use in Timer */}
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='useInTimer'
              checked={useInTimer}
              onChange={(e) => setUseInTimer(e.target.checked)}
              className='h-4 w-4 rounded border-gray-300'
            />
            <Label htmlFor='useInTimer' className='cursor-pointer'>
              타이머 목록에 표시
            </Label>
          </div>

          {/* Submit */}
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='flex-1'
            >
              취소
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-[#22c55e] text-black hover:bg-[#22c55e]/90'
            >
              추가
            </Button>
          </div>
          {/* </div> */}
        </form>
      </div>
    </CustomModal>
  );
}
