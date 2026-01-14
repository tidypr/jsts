'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Play } from 'lucide-react';

interface TimerProps {
  userId: string;
  tab: string;
}

export type MainCategoryType =
  | 'leisure'
  | 'self-development'
  | 'exercise'
  | 'work';

interface Activity {
  id: string;
  icon: string;
  name: string;
  nameEn: string;
  mainCategory: MainCategoryType;
  color: string;
  timeOptions: number[]; // 초 단위
}

interface MainCategory {
  id: MainCategoryType;
  name: string;
  icon: string;
}

const MAIN_CATEGORIES: MainCategory[] = [
  { id: 'leisure', name: '여가활동', icon: '🎨' },
  { id: 'self-development', name: '자기계발', icon: '📚' },
  { id: 'exercise', name: '운동', icon: '💪' },
  { id: 'work', name: '업무', icon: '💼' },
];

const DEFAULT_ACTIVITIES: Activity[] = [
  // 여가활동
  {
    id: 'cooking',
    icon: '🍳',
    name: '요리',
    nameEn: 'Cooking',
    mainCategory: 'leisure',
    color: '#f97316',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'meditation',
    icon: '🧘',
    name: '명상',
    nameEn: 'Meditation',
    mainCategory: 'leisure',
    color: '#8b5cf6',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'game',
    icon: '🎮',
    name: '게임',
    nameEn: 'Gaming',
    mainCategory: 'leisure',
    color: '#ec4899',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'hobby',
    icon: '🎨',
    name: '취미',
    nameEn: 'Hobby',
    mainCategory: 'leisure',
    color: '#a855f7',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'music',
    icon: '🎵',
    name: '음악감상',
    nameEn: 'Music',
    mainCategory: 'leisure',
    color: '#14b8a6',
    timeOptions: [600, 1800, 3600],
  },
  // 자기계발
  {
    id: 'reading',
    icon: '📖',
    name: '독서',
    nameEn: 'Reading',
    mainCategory: 'self-development',
    color: '#f59e0b',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'study',
    icon: '✍️',
    name: '공부',
    nameEn: 'Study',
    mainCategory: 'self-development',
    color: '#22c55e',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'coding',
    icon: '💻',
    name: '코딩',
    nameEn: 'Coding',
    mainCategory: 'self-development',
    color: '#3b82f6',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'language',
    icon: '🌍',
    name: '외국어',
    nameEn: 'Language',
    mainCategory: 'self-development',
    color: '#10b981',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'writing',
    icon: '✏️',
    name: '글쓰기',
    nameEn: 'Writing',
    mainCategory: 'self-development',
    color: '#8b5cf6',
    timeOptions: [600, 1800, 3600],
  },
  // 운동
  {
    id: 'walking',
    icon: '🚶',
    name: '걷기',
    nameEn: 'Walking',
    mainCategory: 'exercise',
    color: '#84cc16',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'running',
    icon: '🏃',
    name: '달리기',
    nameEn: 'Running',
    mainCategory: 'exercise',
    color: '#ef4444',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'cycling',
    icon: '🚴',
    name: '자전거',
    nameEn: 'Cycling',
    mainCategory: 'exercise',
    color: '#06b6d4',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'swimming',
    icon: '🏊',
    name: '수영',
    nameEn: 'Swimming',
    mainCategory: 'exercise',
    color: '#0ea5e9',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'yoga',
    icon: '🧘‍♀️',
    name: '요가',
    nameEn: 'Yoga',
    mainCategory: 'exercise',
    color: '#a855f7',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'gym',
    icon: '🏋️',
    name: '헬스',
    nameEn: 'Gym',
    mainCategory: 'exercise',
    color: '#dc2626',
    timeOptions: [600, 1800, 3600],
  },
  // 업무
  {
    id: 'work',
    icon: '💼',
    name: '업무',
    nameEn: 'Work',
    mainCategory: 'work',
    color: '#06b6d4',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'meeting',
    icon: '🤝',
    name: '회의',
    nameEn: 'Meeting',
    mainCategory: 'work',
    color: '#0891b2',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'email',
    icon: '📧',
    name: '이메일',
    nameEn: 'Email',
    mainCategory: 'work',
    color: '#0284c7',
    timeOptions: [600, 1800, 3600],
  },
  {
    id: 'planning',
    icon: '📋',
    name: '기획',
    nameEn: 'Planning',
    mainCategory: 'work',
    color: '#7c3aed',
    timeOptions: [600, 1800, 3600],
  },
];

export function AllTimerList({}: TimerProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<MainCategoryType>('leisure');
  const [activities] = useState<Activity[]>(DEFAULT_ACTIVITIES);

  const formatTimeLabel = (seconds: number): string => {
    if (seconds < 60) return `${seconds}초`;
    if (seconds < 3600) return `${seconds / 60}분`;
    return `${seconds / 3600}시간`;
  };

  const handleTimeClick = async (activity: Activity, timeInSeconds: number) => {
    // AllTimerList는 임시 활동이므로 템플릿 없이 Phase를 생성할 수 없습니다.
    // 템플릿 생성이 필요하거나, 기존 템플릿을 선택하도록 변경이 필요합니다.
    // 임시로 페이지만 이동하도록 처리합니다.
    router.push(
      `/timer/phase-inprogress?time=${timeInSeconds}&title=${encodeURIComponent(activity.name)}&color=${encodeURIComponent(activity.color)}&emoji=${encodeURIComponent(activity.icon)}`,
    );
  };

  // 필터링된 활동 목록
  const filteredActivities = activities.filter(
    (activity) => activity.mainCategory === selectedCategory,
  );

  return (
    <div className='mx-auto max-w-2xl space-y-6 pb-20'>
      {/* 카테고리 선택 */}
      <div className='sticky top-0 z-10 bg-background pb-4'>
        <Select
          value={selectedCategory}
          onValueChange={(value) =>
            setSelectedCategory(value as MainCategoryType)
          }
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='카테고리를 선택하세요' />
          </SelectTrigger>
          <SelectContent>
            {MAIN_CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className='flex items-center gap-2'>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 활동 목록 */}
      <div className='space-y-4'>
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className='flex items-center justify-between rounded-2xl border bg-muted p-5 transition-colors hover:border-[#2f2f2f]'
          >
            {/* 활동 헤더 */}
            <div className='mb-4 flex items-center gap-3'>
              <div>
                <div className='font-semibold text-foreground'>
                  {activity.name}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {activity.nameEn}
                </div>
              </div>
            </div>

            {/* 시간 선택 버튼들 */}
            <div className='grid grid-cols-3 gap-2'>
              {activity.timeOptions.map((timeInSeconds) => {
                return (
                  <Button
                    key={timeInSeconds}
                    onClick={() => handleTimeClick(activity, timeInSeconds)}
                    className='relative h-14 rounded-xl font-medium transition-all hover:scale-105'
                    style={{
                      backgroundColor: activity.color + '15',
                      color: activity.color,
                      border: `2px solid ${activity.color}40`,
                    }}
                  >
                    <div className='flex flex-col items-center gap-0.5'>
                      <Play className='h-4 w-4' fill='currentColor' />
                      <span className='text-xs'>
                        {formatTimeLabel(timeInSeconds)}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 활동이 없을 때 */}
      {filteredActivities.length === 0 && (
        <div className='py-12 text-center text-muted-foreground'>
          이 카테고리에는 활동이 없습니다.
        </div>
      )}
    </div>
  );
}
