export interface Goal {
  id: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  targetMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface GoalWithProgress extends Goal {
  currentMinutes?: number;
  progress?: number; // 0-100
}

export const GoalTypeLabels = {
  DAILY: '일간',
  WEEKLY: '주간',
  MONTHLY: '월간',
} as const;

export const GoalTypeDescriptions = {
  DAILY: '매일 달성하고 싶은 목표 시간을 설정하세요',
  WEEKLY: '일주일 동안 달성하고 싶은 목표 시간을 설정하세요',
  MONTHLY: '한 달 동안 달성하고 싶은 목표 시간을 설정하세요',
} as const;
