/**
 * Segment 데이터 타입
 */
export interface SegmentData {
  id: string;
  startTime: Date;
  endTime: Date | null;
  phaseId: string;
}

/**
 * Phase 데이터 타입
 */
export interface PhaseData {
  id: string;
  title?: string | null;
  emoji?: string | null;
  color?: string | null;
  startTime: Date | null;
  endTime: Date | null;
  note: string | null;
  isAutomatic: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  userId: string;
  segments?: SegmentData[];
}

/**
 * 통계 데이터 타입
 */
export interface StatsData {
  /** 총 활동 시간 (분) */
  totalTime: number;
  /** 총 활동 시간 변화율 (%) */
  totalTimeChange: number;
  /** 평균 활동 시간 (분) */
  avgTime: number;
  /** 평균 활동 시간 변화율 (%) */
  avgTimeChange: number;
  /** 연속 일수 */
  streak: number;
  /** 카테고리별 시간 (분) */
  categoryTime: Record<string, number>;
  /** 일별 시간 */
  dailyTime: { date: string; time: number }[];
}

/**
 * 월간 데이터 타입
 */
export interface MonthlyData {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  categories: Record<string, number>;
}

/**
 * 카테고리별 총 시간 타입
 */
export interface CategoryTotal {
  category: string;
  minutes: number;
  hours: number;
  percentage: number;
}

/**
 * 월간 통계 요약
 */
export interface MonthlySummary {
  totalMinutes: number;
  totalHours: number;
  activeDays: number;
  totalDays: number;
  avgMinutesPerDay: number;
  avgMinutesPerActiveDay: number;
  mostProductiveDay: {
    date: string;
    minutes: number;
  };
  topCategory: {
    category: string;
    minutes: number;
    percentage: number;
  };
}
