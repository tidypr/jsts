'use client';

import { useEffect, useState } from 'react';
import Timer from '../timer';
import { Button } from '@/shared/components/ui/button';
import { Play, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';

import TimeAddBtn from './TimeAddBtn';
import AddTimerDialog from './AddTimerDialog';

export type ActivityCategory =
  | 'study'
  | 'work'
  | 'exercise'
  | 'reading'
  | 'coding'
  | 'meeting'
  | 'project'
  | 'other';

interface TimerProps {
  userId: string;
  tab: string;
}

export interface GoalPreset {
  id: string;
  title: string;
  category: ActivityCategory;
  color: string;
  defaultTime: number; // 초 단위
}

const STORAGE_KEY = 'timer-goal-presets';

export const DEFAULT_PRESETS: GoalPreset[] = [
  {
    id: '1',
    title: '수학 문제 풀이',
    category: 'study',
    color: '#22c55e',
    defaultTime: 1500, // 25분
  },
  {
    id: '2',
    title: '코딩 연습',
    category: 'coding',
    color: '#3b82f6',
    defaultTime: 3600, // 60분
  },
  {
    id: '3',
    title: '독서',
    category: 'reading',
    color: '#f59e0b',
    defaultTime: 1800, // 30분
  },
  {
    id: '4',
    title: 'tset',
    category: 'reading',
    color: '#fe498a',
    defaultTime: 5, // 30분
  },
];

export default function TimerList({ userId, tab }: TimerProps) {
  const [goalPresets, setGoalPresets] = useState<GoalPreset[]>(DEFAULT_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<GoalPreset | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const isEdit = false;

  const handleAddPreset = (preset: GoalPreset) => {
    setGoalPresets((prev) => [...prev, preset]);
    setShowAddDialog(false);
  };

  const handleDeletePreset = (id: string) => {
    setGoalPresets((prev) => prev.filter((preset) => preset.id !== id));
  };

  // 로컬스토리지에서 프리셋 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedPresets = JSON.parse(stored);
        setGoalPresets(parsedPresets);
      } catch (e) {
        console.error('Failed to parse presets from localStorage', e);
      }
    }
  }, []);

  // 프리셋 변경 시 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goalPresets));
  }, [goalPresets]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePlayClick = (preset: GoalPreset) => {
    setSelectedPreset(preset);
    setShowTimer(true);
  };

  return (
    <>
      {/* Timer Dialog */}
      <Dialog open={showTimer} onOpenChange={setShowTimer}>
        <DialogContent className='max-h-[90vh] overflow-y-auto border-[#1f1f1f] sm:max-w-md'>
          <DialogTitle className='sr-only'>
            {selectedPreset?.title || '타이머'}
          </DialogTitle>
          <DialogDescription className='sr-only'>
            목표 시간을 설정하고 타이머를 시작하세요
          </DialogDescription>
          {selectedPreset && (
            <Timer
              userId={userId}
              initialTime={selectedPreset.defaultTime}
              goalTitle={selectedPreset.title}
              color={selectedPreset.color}
              onClose={() => setShowTimer(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Timer Dialog */}
      <AddTimerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddPreset}
      />

      <div className='mx-auto max-w-md space-y-4'>
        {/* Timer List */}
        <div className='space-y-3'>
          {goalPresets.map((preset) => (
            <div
              key={preset.id}
              className='flex items-center gap-3 rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] p-4 transition-colors hover:border-[#2f2f2f]'
            >
              <div
                className='h-10 w-10 rounded-full'
                style={{ backgroundColor: preset.color }}
              />
              <div className='flex-1'>
                <div className='font-medium'>{preset.title}</div>
                <div className='text-sm text-gray-400'>
                  {formatTime(preset.defaultTime)}
                </div>
              </div>
              <>
                {isEdit ? (
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => handleDeletePreset(preset.id)}
                    className='h-8 w-8 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-500'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                ) : (
                  <Button
                    size='icon'
                    onClick={() => handlePlayClick(preset)}
                    className='h-10 w-10 rounded-full bg-[#22c55e] text-black hover:bg-[#22c55e]/90'
                  >
                    <Play className='h-5 w-5' fill='currentColor' />
                  </Button>
                )}
              </>
            </div>
          ))}
        </div>
      </div>

      <TimeAddBtn onClick={() => setShowAddDialog(true)} />
    </>
  );
}
