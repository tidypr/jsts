'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { GoalPreset, ActivityCategory } from './index';

interface AddTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (preset: GoalPreset) => void;
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

const CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: 'study', label: '공부' },
  { value: 'work', label: '업무' },
  { value: 'exercise', label: '운동' },
  { value: 'reading', label: '독서' },
  { value: 'coding', label: '코딩' },
  { value: 'meeting', label: '회의' },
  { value: 'project', label: '프로젝트' },
  { value: 'other', label: '기타' },
];

export default function AddTimerDialog({
  open,
  onOpenChange,
  onAdd,
}: AddTimerDialogProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('study');
  const [color, setColor] = useState(COLORS[0]);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('25');
  const [seconds, setSeconds] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalSeconds =
      parseInt(hours || '0') * 3600 +
      parseInt(minutes || '0') * 60 +
      parseInt(seconds || '0');

    if (!title.trim() || totalSeconds <= 0) {
      return;
    }

    const newPreset: GoalPreset = {
      id: Date.now().toString(),
      title: title.trim(),
      category,
      color,
      defaultTime: totalSeconds,
    };

    onAdd(newPreset);

    // Reset form
    setTitle('');
    setCategory('study');
    setColor(COLORS[0]);
    setHours('0');
    setMinutes('25');
    setSeconds('0');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-2xl border-[#1f1f1f] sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>새 타이머 추가</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className='max-h-[calc(90vh-8rem)] space-y-4 overflow-y-auto px-4'
        >
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title'>제목</Label>
            <Input
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='예: 수학 문제 풀이'
              className='border-[#1f1f1f] bg-[#0a0a0a]'
            />
          </div>

          {/* Category */}
          <div className='space-y-2'>
            <Label htmlFor='category'>카테고리</Label>
            <select
              id='category'
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityCategory)}
              className='flex h-10 w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-base'
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
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
                  className='border-[#1f1f1f] bg-[#0a0a0a]'
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
                  className='border-[#1f1f1f] bg-[#0a0a0a]'
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
                  className='border-[#1f1f1f] bg-[#0a0a0a]'
                />
              </div>
            </div>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
