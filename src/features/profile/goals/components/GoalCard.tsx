'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Edit2, Save, X, Trash2, Target } from 'lucide-react';
import type { Goal } from '../goals.type';
import { GoalTypeLabels } from '../goals.type';
import { useUpsertGoal, useDeleteGoal } from '../hooks/useGoals';
import { toast } from 'sonner';

interface GoalCardProps {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  goal?: Goal | null;
}

const GOAL_TYPE_COLORS = {
  DAILY: '#22c55e',
  WEEKLY: '#3b82f6',
  MONTHLY: '#a855f7',
};

const GOAL_TYPE_ICONS = {
  DAILY: '📅',
  WEEKLY: '📆',
  MONTHLY: '🗓️',
};

export function GoalCard({ type, goal }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(!goal);
  const [hours, setHours] = useState(
    goal?.targetMinutes ? Math.floor(goal.targetMinutes / 60) : 0
  );
  const [minutes, setMinutes] = useState(
    goal?.targetMinutes ? goal.targetMinutes % 60 : 0
  );

  const upsertGoalMutation = useUpsertGoal();
  const deleteGoalMutation = useDeleteGoal();
  const color = GOAL_TYPE_COLORS[type];

  const handleSave = async () => {
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes < 1) {
      toast.error('목표 시간은 최소 1분 이상이어야 합니다');
      return;
    }

    try {
      await upsertGoalMutation.mutateAsync({
        type,
        targetMinutes: totalMinutes,
      });

      toast.success('목표가 성공적으로 저장되었습니다');
      setIsEditing(false);
    } catch {
      toast.error('목표를 저장하는 중 오류가 발생했습니다');
    }
  };

  const handleDelete = async () => {
    if (!goal) return;

    if (!confirm('정말로 이 목표를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteGoalMutation.mutateAsync(type);
      toast.success('목표가 성공적으로 삭제되었습니다');
      setIsEditing(true);
      setHours(0);
      setMinutes(0);
    } catch {
      toast.error('목표를 삭제하는 중 오류가 발생했습니다');
    }
  };

  const handleCancel = () => {
    if (goal) {
      setHours(Math.floor(goal.targetMinutes / 60));
      setMinutes(goal.targetMinutes % 60);
      setIsEditing(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}분`;
    if (mins === 0) return `${hours}시간`;
    return `${hours}시간 ${mins}분`;
  };

  return (
    <Card className='overflow-hidden transition-all hover:shadow-md'>
      {/* Header with colored accent */}
      <div
        className='h-1 w-full'
        style={{ backgroundColor: color }}
      />
      
      <div className='p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className='flex h-12 w-12 items-center justify-center rounded-xl text-2xl'
              style={{ backgroundColor: `${color}15` }}
            >
              {GOAL_TYPE_ICONS[type]}
            </div>
            <div>
              <h3 className='text-lg font-bold text-foreground'>
                {GoalTypeLabels[type]} 목표
              </h3>
              <p className='text-xs text-muted-foreground'>
                {type === 'DAILY' && '매일 달성하고 싶은 목표'}
                {type === 'WEEKLY' && '일주일 동안 달성하고 싶은 목표'}
                {type === 'MONTHLY' && '한 달 동안 달성하고 싶은 목표'}
              </p>
            </div>
          </div>
          {!isEditing && goal && (
            <div className='flex gap-1'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsEditing(true)}
                disabled={upsertGoalMutation.isPending}
                className='h-8 w-8'
              >
                <Edit2 className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleDelete}
                disabled={deleteGoalMutation.isPending}
                className='h-8 w-8'
              >
                <Trash2 className='h-4 w-4 text-destructive' />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='mb-2 block text-xs font-medium text-muted-foreground'>
                  시간
                </label>
                <Input
                  type='number'
                  min='0'
                  max='168'
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  placeholder='0'
                  className='text-center text-lg font-semibold'
                />
              </div>
              <div>
                <label className='mb-2 block text-xs font-medium text-muted-foreground'>
                  분
                </label>
                <Input
                  type='number'
                  min='0'
                  max='59'
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  placeholder='0'
                  className='text-center text-lg font-semibold'
                />
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={handleSave}
                className='flex-1'
                style={{ backgroundColor: color }}
                disabled={upsertGoalMutation.isPending}
              >
                <Save className='mr-2 h-4 w-4' />
                {upsertGoalMutation.isPending ? '저장 중...' : '저장'}
              </Button>
              {goal && (
                <Button
                  variant='outline'
                  onClick={handleCancel}
                  disabled={upsertGoalMutation.isPending}
                  className='flex-1'
                >
                  <X className='mr-2 h-4 w-4' />
                  취소
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div
            className='rounded-xl p-6'
            style={{ backgroundColor: `${color}10` }}
          >
            <div className='text-center'>
              <Target
                className='mx-auto mb-2 h-6 w-6'
                style={{ color }}
              />
              <p className='text-xs font-medium text-muted-foreground'>
                목표 시간
              </p>
              <p
                className='mt-2 text-4xl font-bold'
                style={{ color }}
              >
                {goal ? formatTime(goal.targetMinutes) : '미설정'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
