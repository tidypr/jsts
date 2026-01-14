import type {
  PhaseData,
  StatsData,
  MonthlyData,
  CategoryTotal,
  MonthlySummary,
} from './types';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subDays,
  subWeeks,
  subMonths,
  format,
  isSameDay,
} from 'date-fns';

/**
 * Phase의 소요 시간을 분 단위로 계산
 * Segment들의 총 시간을 합산하여 계산
 */
export function calculatePhaseDuration(phase: PhaseData): number {
  if (!phase.segments || phase.segments.length === 0) {
    return 0;
  }

  return phase.segments.reduce((total, segment) => {
    const start = new Date(segment.startTime).getTime();
    const end = segment.endTime
      ? new Date(segment.endTime).getTime()
      : new Date().getTime();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    return total + minutes;
  }, 0);
}

/**
 * 일간 Phase 필터링
 */
export function filterDailyPhases(
  phases: PhaseData[],
  date: Date = new Date(),
): PhaseData[] {
  const start = startOfDay(date);
  const end = endOfDay(date);

  return phases.filter((phase) => {
    if (!phase.startTime) return false;
    const phaseDate = new Date(phase.startTime);
    const isCompleted = phase.status === 'COMPLETED';
    const isInRange = phaseDate >= start && phaseDate <= end;
    return isCompleted && isInRange;
  });
}

/**
 * 주간 Phase 필터링
 */
export function filterWeeklyPhases(
  phases: PhaseData[],
  date: Date = new Date(),
): PhaseData[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // 월요일 시작
  const end = endOfWeek(date, { weekStartsOn: 1 });

  return phases.filter((phase) => {
    if (!phase.startTime) return false;
    const phaseDate = new Date(phase.startTime);
    const isCompleted = phase.status === 'COMPLETED';
    const isInRange = phaseDate >= start && phaseDate <= end;
    return isCompleted && isInRange;
  });
}

/**
 * 월간 Phase 필터링
 */
export function filterMonthlyPhases(
  phases: PhaseData[],
  date: Date = new Date(),
): PhaseData[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return phases.filter((phase) => {
    if (!phase.startTime) return false;
    const phaseDate = new Date(phase.startTime);
    const isCompleted = phase.status === 'COMPLETED';
    const isInRange = phaseDate >= start && phaseDate <= end;
    return isCompleted && isInRange;
  });
}

/**
 * 특정 날짜의 Phase들 필터링
 */
export function filterPhasesByDate(
  phases: PhaseData[],
  targetDate: Date,
): PhaseData[] {
  return phases.filter((phase) => {
    if (!phase.startTime) return false;
    const phaseDate = new Date(phase.startTime);
    return isSameDay(phaseDate, targetDate);
  });
}

/**
 * 총 시간 계산 (분 단위)
 */
export function calculateTotalTime(phases: PhaseData[]): number {
  return phases.reduce(
    (total, phase) => total + calculatePhaseDuration(phase),
    0,
  );
}

/**
 * 평균 활동 시간 계산 (분 단위)
 */
export function calculateAvgTime(phases: PhaseData[]): number {
  if (phases.length === 0) return 0;
  return Math.round(calculateTotalTime(phases) / phases.length);
}

/**
 * 카테고리별 시간 계산
 */
export function calculateCategoryTime(
  phases: PhaseData[],
): Record<string, number> {
  const categoryTime: Record<string, number> = {};

  phases.forEach((phase) => {
    const categoryName = phase.title || '기타';
    if (!categoryTime[categoryName]) {
      categoryTime[categoryName] = 0;
    }
    categoryTime[categoryName] += calculatePhaseDuration(phase);
  });

  return categoryTime;
}

/**
 * 일별 시간 계산
 */
export function calculateDailyTime(
  phases: PhaseData[],
  days: number = 7,
): { date: string; time: number }[] {
  const dailyTime: { date: string; time: number }[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayPhases = filterDailyPhases(phases, date);
    const time = calculateTotalTime(dayPhases);

    dailyTime.push({ date: dateStr, time });
  }

  return dailyTime;
}

/**
 * 연속 일수 계산
 */
export function calculateStreak(phases: PhaseData[]): number {
  const today = new Date();
  let streak = 0;
  let currentDate = today;

  while (true) {
    const dayPhases = filterDailyPhases(phases, currentDate);

    if (dayPhases.length > 0) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }

    // 최대 365일까지만 계산
    if (streak >= 365) break;
  }

  return streak;
}

/**
 * 변화율 계산 (%)
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * 일간 통계 계산
 */
export function calculateDailyStats(
  phases: PhaseData[],
  date: Date = new Date(),
): StatsData {
  const todayPhases = filterDailyPhases(phases, date);
  const yesterdayPhases = filterDailyPhases(phases, subDays(date, 1));

  const totalTime = calculateTotalTime(todayPhases);
  const previousTotalTime = calculateTotalTime(yesterdayPhases);

  const avgTime = calculateAvgTime(todayPhases);
  const previousAvgTime = calculateAvgTime(yesterdayPhases);

  return {
    totalTime,
    totalTimeChange: calculateChange(totalTime, previousTotalTime),
    avgTime,
    avgTimeChange: calculateChange(avgTime, previousAvgTime),
    streak: calculateStreak(phases),
    categoryTime: calculateCategoryTime(todayPhases),
    dailyTime: calculateDailyTime(phases, 7),
  };
}

/**
 * 주간 통계 계산
 */
export function calculateWeeklyStats(
  phases: PhaseData[],
  date: Date = new Date(),
): StatsData {
  const thisWeekPhases = filterWeeklyPhases(phases, date);
  const lastWeekPhases = filterWeeklyPhases(phases, subWeeks(date, 1));

  const totalTime = calculateTotalTime(thisWeekPhases);
  const previousTotalTime = calculateTotalTime(lastWeekPhases);

  const avgTime = calculateAvgTime(thisWeekPhases);
  const previousAvgTime = calculateAvgTime(lastWeekPhases);

  return {
    totalTime,
    totalTimeChange: calculateChange(totalTime, previousTotalTime),
    avgTime,
    avgTimeChange: calculateChange(avgTime, previousAvgTime),
    streak: calculateStreak(phases),
    categoryTime: calculateCategoryTime(thisWeekPhases),
    dailyTime: calculateDailyTime(phases, 7),
  };
}

/**
 * 월간 통계 계산
 */
export function calculateMonthlyStats(
  phases: PhaseData[],
  date: Date = new Date(),
): StatsData {
  const thisMonthPhases = filterMonthlyPhases(phases, date);
  const lastMonthPhases = filterMonthlyPhases(phases, subMonths(date, 1));

  const totalTime = calculateTotalTime(thisMonthPhases);
  const previousTotalTime = calculateTotalTime(lastMonthPhases);

  const avgTime = calculateAvgTime(thisMonthPhases);
  const previousAvgTime = calculateAvgTime(lastMonthPhases);

  return {
    totalTime,
    totalTimeChange: calculateChange(totalTime, previousTotalTime),
    avgTime,
    avgTimeChange: calculateChange(avgTime, previousAvgTime),
    streak: calculateStreak(phases),
    categoryTime: calculateCategoryTime(thisMonthPhases),
    dailyTime: calculateDailyTime(phases, 30),
  };
}

/**
 * 일별 데이터 생성 (월간)
 */
export function generateMonthlyData(
  phases: PhaseData[],
  targetDate: Date = new Date(),
): MonthlyData[] {
  const start = startOfMonth(targetDate);
  const end = endOfMonth(targetDate);
  const daysInMonth = eachDayOfInterval({ start, end });

  return daysInMonth.map((day) => {
    const dayPhases = filterPhasesByDate(phases, day);
    const categories: Record<string, number> = {};
    let totalMinutes = 0;

    dayPhases.forEach((phase) => {
      const duration = calculatePhaseDuration(phase);
      totalMinutes += duration;

      const categoryName = phase.title || '기타';
      if (!categories[categoryName]) {
        categories[categoryName] = 0;
      }
      categories[categoryName] += duration;
    });

    return {
      date: format(day, 'yyyy-MM-dd'),
      totalMinutes,
      categories,
    };
  });
}

/**
 * 월간 카테고리별 총 시간 계산
 */
export function calculateMonthlyCategoryTotals(
  phases: PhaseData[],
  targetDate: Date = new Date(),
): CategoryTotal[] {
  const monthPhases = filterMonthlyPhases(phases, targetDate);
  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;

  monthPhases.forEach((phase) => {
    const duration = calculatePhaseDuration(phase);
    grandTotal += duration;

    const categoryName = phase.title || '기타';
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = 0;
    }
    categoryTotals[categoryName] += duration;
  });

  return Object.entries(categoryTotals)
    .map(([category, minutes]) => ({
      category,
      minutes,
      hours: Math.round((minutes / 60) * 10) / 10,
      percentage: grandTotal > 0 ? Math.round((minutes / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

/**
 * 월간 통계 요약 계산
 */
export function calculateMonthlySummary(
  phases: PhaseData[],
  targetDate: Date = new Date(),
): MonthlySummary {
  const monthlyData = generateMonthlyData(phases, targetDate);
  const categoryTotals = calculateMonthlyCategoryTotals(phases, targetDate);

  const totalMinutes = monthlyData.reduce(
    (sum, day) => sum + day.totalMinutes,
    0,
  );
  const activeDays = monthlyData.filter((day) => day.totalMinutes > 0).length;
  const totalDays = monthlyData.length;

  const mostProductiveDay = monthlyData.reduce(
    (max, day) =>
      day.totalMinutes > max.minutes
        ? { date: day.date, minutes: day.totalMinutes }
        : max,
    { date: '', minutes: 0 },
  );

  const topCategory = categoryTotals[0] || {
    category: 'none',
    minutes: 0,
    percentage: 0,
  };

  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    activeDays,
    totalDays,
    avgMinutesPerDay: totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0,
    avgMinutesPerActiveDay:
      activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0,
    mostProductiveDay,
    topCategory: {
      category: topCategory.category,
      minutes: topCategory.minutes,
      percentage: topCategory.percentage,
    },
  };
}

/**
 * 분을 시간:분 형식으로 변환
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}분`;
  }

  if (mins === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${mins}분`;
}

/**
 * 카테고리 색상 라벨 매핑
 */
export const CATEGORY_LABELS: Record<string, string> = {
  '#22c55e': '💼 업무',
  '#3b82f6': '📚 공부',
  '#a855f7': '💪 운동',
  '#eab308': '🎨 취미',
  '#ec4899': '👥 사교',
  '#6366f1': '😴 휴식',
  '#f97316': '👨‍👩‍👧 가족',
  '#6b7280': '🔖 기타',
};

/**
 * 카테고리 색상을 라벨로 변환
 */
export function getCategoryLabel(color: string): string {
  return CATEGORY_LABELS[color] || '🔖 기타';
}
