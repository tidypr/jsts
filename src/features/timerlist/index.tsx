'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Play, X, StickyNote } from 'lucide-react';

import TimeAddBtn from './TimeAddBtn';
import AddTimerDialog from './AddTimerDialog';
import { startPhaseAction } from '@/features/PhaseForm/actions/startPhase.action';
import {
  useTimerTemplates,
  useCreateActivityTemplate,
  useUpdateActivityTemplate,
  useDeleteActivityTemplate,
} from './hooks/useActivityTemplates';
import type { ActivityTemplate } from '@/features/activityTemplate/activityTemplate.schema';

interface TimerProps {
  userId: string;
  tab: string;
}

export interface GoalPreset {
  id: string;
  title: string;
  note?: string;
  emoji?: string;
  color: string;
  defaultTime: number; // 초 단위
  useInTimer?: boolean;
}

export default function TimerList({ userId }: TimerProps) {
  const router = useRouter();
  const { data: goalPresets, isLoading } = useTimerTemplates(userId);
  const createMutation = useCreateActivityTemplate(userId);
  const updateMutation = useUpdateActivityTemplate(userId);
  const deleteMutation = useDeleteActivityTemplate(userId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [timeInput, setTimeInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isEdit = false;

  const handleAddPreset = (preset: Omit<GoalPreset, 'id'>) => {
    createMutation.mutate({
      ...preset,
      useInTimer: preset.useInTimer ?? true,
    });
    setShowAddDialog(false);
  };

  const handleDeletePreset = (id: string) => {
    deleteMutation.mutate(id);
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

  const handlePlayClick = async (preset: ActivityTemplate) => {
    try {
      const result = await startPhaseAction({
        userId,
        templateId: preset.id,
      });

      if (!result.success) {
        // 실패해도 페이지 이동 (페이지에서 다시 시도)
        router.push(
          `/timer/phase-inprogress?time=${preset.defaultTime}&title=${encodeURIComponent(preset.title)}&color=${encodeURIComponent(preset.color)}&emoji=${encodeURIComponent(preset.emoji || '')}&templateId=${preset.id}`,
        );
        return;
      }

      // 성공 시 phaseId와 함께 페이지 이동
      router.push(
        `/timer/phase-inprogress?phaseId=${result.data.id}&time=${preset.defaultTime}&title=${encodeURIComponent(preset.title)}&color=${encodeURIComponent(preset.color)}&emoji=${encodeURIComponent(preset.emoji || '')}&templateId=${preset.id}`,
      );
    } catch {
      // 에러 발생 시에도 페이지 이동 (페이지에서 다시 시도)
      router.push(
        `/timer/phase-inprogress?time=${preset.defaultTime}&title=${encodeURIComponent(preset.title)}&color=${encodeURIComponent(preset.color)}&emoji=${encodeURIComponent(preset.emoji || '')}&templateId=${preset.id}`,
      );
    }
  };

  const handleTimeClick = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTemplateId(templateId);
    setTimeInput('');
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 숫자만 허용
    setTimeInput(value);
  };

  const handleTimeInputSubmit = () => {
    if (!timeInput || !editingTemplateId) {
      setEditingTemplateId(null);
      setTimeInput('');
      return;
    }

    const seconds = parseTimeInput(timeInput);
    if (seconds > 0) {
      updateMutation.mutate({
        templateId: editingTemplateId,
        data: { defaultTime: seconds },
      });
    }
    setEditingTemplateId(null);
    setTimeInput('');
  };

  const handleTimeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTimeInputSubmit();
    } else if (e.key === 'Escape') {
      setEditingTemplateId(null);
      setTimeInput('');
    }
  };

  // 편집 모드 활성화 시 input에 focus
  useEffect(() => {
    if (editingTemplateId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingTemplateId]);

  return (
    <>
      {/* Add Timer Dialog */}
      <AddTimerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddPreset}
      />

      <div className='mx-auto max-w-2xl space-y-4'>
        {/* Loading State */}
        {isLoading && (
          <div className='py-8 text-center text-muted-foreground'>
            로딩 중...
          </div>
        )}

        {/* Timer List */}

        <div className='space-y-3'>
          {!isLoading &&
            goalPresets &&
            goalPresets.map((preset) => (
              <div
                key={preset.id}
                className='flex items-center gap-3 rounded-2xl border p-4 transition-colors hover:bg-accent/50'
              >
                <div className='flex-1 space-y-2'>
                  <div
                    className='inline-block rounded-md px-3 py-1 text-sm font-medium'
                    style={{
                      backgroundColor: `${preset.color}20`,
                      color: preset.color,
                      border: `1px solid ${preset.color}40`,
                    }}
                  >
                    {preset.title}
                  </div>
                  {preset.note && (
                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                      <StickyNote className='h-4 w-4' />
                      <span>{preset.note}</span>
                    </div>
                  )}
                  {editingTemplateId === preset.id ? (
                    <input
                      ref={inputRef}
                      type='text'
                      inputMode='numeric'
                      value={formatInputAsTime(timeInput)}
                      onChange={handleTimeInputChange}
                      onBlur={handleTimeInputSubmit}
                      onKeyDown={handleTimeInputKeyDown}
                      placeholder='00:00'
                      className='w-20 bg-transparent text-sm text-gray-400 outline-none'
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className='cursor-pointer text-sm text-gray-400 transition-colors hover:text-[#22c55e]'
                      onClick={(e) => handleTimeClick(preset.id, e)}
                    >
                      {formatTime(preset.defaultTime)}
                    </div>
                  )}
                </div>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayClick(preset);
                    }}
                    className='h-10 w-10 rounded-full bg-[#22c55e] text-black hover:bg-[#22c55e]/90'
                  >
                    <Play className='h-5 w-5' fill='currentColor' />
                  </Button>
                )}
              </div>
            ))}
        </div>
      </div>

      <TimeAddBtn onClick={() => setShowAddDialog(true)} />
    </>
  );
}
