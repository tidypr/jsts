'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { PhaseFormData, phaseSchema } from './phaseSchema';
import { useCreatePhase } from './hooks/useCreatePhase';

interface ManualTimeInputProps {
  onClose: () => void;
  userId?: string;
}

const DEFAULT_COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export default function PhaseForm({ onClose, userId }: ManualTimeInputProps) {
  const { mutate: createPhase, isPending } = useCreatePhase();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PhaseFormData>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: DEFAULT_COLORS[0],
      startTime: '',
      endTime: '',
      note: '',
    },
  });

  if (!userId) {
    alert('로그인이 필요합니다.');
    return;
  }

  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');
  const watchedCategory = watch('category');

  const onSubmit = (data: PhaseFormData) => {
    const startDateTime = new Date(`${data.date}T${data.startTime}`);
    const endDateTime = new Date(`${data.date}T${data.endTime}`);

    createPhase(
      {
        userId,
        category: data.category,
        date: new Date(data.date),
        startTime: startDateTime,
        endTime: endDateTime,
        note: data.note,
      },
      {
        onSuccess: () => {
          alert('세션이 저장되었습니다.');
          onClose();
        },
        onError: (error) => {
          alert(error.message || '세션 생성 중 오류가 발생했습니다.');
        },
      },
    );
  };

  const calculateDuration = (): string => {
    if (!watchedStartTime || !watchedEndTime) return '';

    const start = new Date(`2000-01-01T${watchedStartTime}`);
    const end = new Date(`2000-01-01T${watchedEndTime}`);
    const diff = (end.getTime() - start.getTime()) / 1000 / 60;
    const hours = Math.floor(diff / 60);
    const minutes = Math.floor(diff % 60);

    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-center'>
        <h1 className='text-xl font-bold'>수동 기록 입력</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>날짜</Label>
            <Input
              type='date'
              {...register('date')}
              className='border-[#1f1f1f]'
              data-testid='manual-time-input-date'
            />
            {errors.date && (
              <p className='text-sm text-red-500'>{errors.date.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>색상</Label>
            <div className='flex items-center gap-3'>
              <input
                type='color'
                value={watchedCategory}
                onChange={(e) => setValue('category', e.target.value)}
                className='h-12 w-16 cursor-pointer rounded-lg border border-[#1f1f1f] bg-transparent'
                data-testid='manual-time-input-category'
              />
              <div className='flex flex-wrap gap-2'>
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type='button'
                    onClick={() => setValue('category', color)}
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      watchedCategory === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            {errors.category && (
              <p className='text-sm text-red-500'>{errors.category.message}</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm text-muted-foreground'>시작 시간</Label>
              <Input
                type='time'
                {...register('startTime')}
                className='border-[#1f1f1f]'
                data-testid='manual-time-input-start-time'
              />
              {errors.startTime && (
                <p className='text-sm text-red-500'>
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label className='text-sm text-muted-foreground'>종료 시간</Label>
              <Input
                type='time'
                value={watchedEndTime}
                {...register('endTime')}
                className='border-[#1f1f1f]'
                data-testid='manual-time-input-end-time'
              />
              {errors.endTime && (
                <p className='text-sm text-red-500'>{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {watchedStartTime && watchedEndTime && (
            <Card className='border-[#22c55e]/30 bg-[#22c55e]/10 p-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>사용 시간</span>
                <span
                  className='text-lg font-bold text-[#22c55e]'
                  data-testid='manual-time-input-duration'
                >
                  {calculateDuration()}
                </span>
              </div>
            </Card>
          )}

          <div className='space-y-2'>
            <Label className='text-sm text-muted-foreground'>
              메모 (선택사항)
            </Label>
            <Textarea
              {...register('note')}
              placeholder='오늘 공부한 내용을 기록해보세요...'
              className='min-h-[120px] resize-none border-[#1f1f1f]'
              data-testid='manual-time-input-memo'
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-[#22c55e] py-6 font-semibold text-black hover:bg-[#22c55e]/90'
            disabled={isPending}
            data-testid='manual-time-input-save-button'
          >
            {isPending ? '저장 중...' : '저장하기'}
          </Button>

          <Button
            type='button'
            variant='outline'
            className='w-full py-6 font-semibold'
            onClick={onClose}
            disabled={isPending}
            data-testid='manual-time-input-cancel-button'
          >
            취소하기
          </Button>
        </form>
    </div>
  );
}
