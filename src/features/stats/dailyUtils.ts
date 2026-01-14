import type { PhaseData } from './types';

/**
 * Segment 시간 계산 (분)
 */
export function calculateSegmentDuration(segment: {
  startTime: Date | string;
  endTime: Date | string | null;
}): number {
  if (!segment.endTime) return 0;

  const start = new Date(segment.startTime);
  const end = new Date(segment.endTime);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * 일별 요약 데이터
 */
export interface DailySummary {
  date: string;
  totalHours: number;
  totalMinutes: number;
  phaseCount: number;
  categories: Record<string, number>;
}

/**
 * 일별 요약 생성 (최근 30일)
 */
export function generateDailySummary(phases: PhaseData[]): DailySummary[] {
  const dailyMap = new Map<string, DailySummary>();

  // 최근 30일 초기화
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];

    dailyMap.set(dateStr, {
      date: dateStr,
      totalHours: 0,
      totalMinutes: 0,
      phaseCount: 0,
      categories: {},
    });
  }

  // 데이터 집계
  phases.forEach((phase) => {
    if (!phase.startTime) return;

    const phaseDate = new Date(phase.startTime);
    phaseDate.setHours(0, 0, 0, 0);
    const dateStr = phaseDate.toISOString().split('T')[0];
    const summary = dailyMap.get(dateStr);

    if (summary) {
      const duration =
        phase.segments?.reduce(
          (total, segment) => total + calculateSegmentDuration(segment),
          0,
        ) || 0;

      summary.totalMinutes += duration;
      summary.totalHours = Math.round((summary.totalMinutes / 60) * 10) / 10;
      summary.phaseCount += 1;

      const category = phase.title || '기타';
      summary.categories[category] =
        (summary.categories[category] || 0) + duration;
    }
  });

  return Array.from(dailyMap.values());
}

/**
 * 시간대별 활동
 */
export interface HourlyActivity {
  hour: number;
  category: string;
  duration: number; // 분
}

/**
 * 시간대별 활동 생성 (특정 날짜)
 */
export function generateHourlyActivities(
  phases: PhaseData[],
  targetDate: Date,
): HourlyActivity[] {
  const activities: HourlyActivity[] = [];
  const targetDateStr = targetDate.toISOString().split('T')[0];

  phases.forEach((phase) => {
    if (!phase.startTime) return;

    const phaseDateStr = new Date(phase.startTime).toISOString().split('T')[0];
    if (phaseDateStr !== targetDateStr) return;

    phase.segments?.forEach((segment) => {
      if (!segment.endTime) return;

      const startTime = new Date(segment.startTime);
      const hour = startTime.getHours();
      const duration = calculateSegmentDuration(segment);

      activities.push({
        hour,
        category: phase.title || '기타',
        duration,
      });
    });
  });

  return activities;
}

/**
 * 카테고리별 요약
 */
export interface CategorySummary {
  category: string;
  totalHours: number;
  totalMinutes: number;
  count: number;
  color: string;
}

/**
 * 카테고리별 요약 생성 (최근 30일)
 */
export function generateCategorySummary(
  phases: PhaseData[],
): CategorySummary[] {
  const categoryMap = new Map<string, CategorySummary>();

  // 최근 30일 데이터만 필터링
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  phases
    .filter((phase) => {
      if (!phase.startTime) return false;
      return new Date(phase.startTime) >= thirtyDaysAgo;
    })
    .forEach((phase) => {
      const category = phase.title || '기타';
      const duration =
        phase.segments?.reduce(
          (total, segment) => total + calculateSegmentDuration(segment),
          0,
        ) || 0;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          totalHours: 0,
          totalMinutes: 0,
          count: 0,
          color: phase.color || '#6b7280',
        });
      }

      const summary = categoryMap.get(category)!;
      summary.totalMinutes += duration;
      summary.totalHours = Math.round((summary.totalMinutes / 60) * 10) / 10;
      summary.count += 1;
    });

  return Array.from(categoryMap.values()).sort(
    (a, b) => b.totalMinutes - a.totalMinutes,
  );
}

/**
 * 시간대별 차트 데이터 생성
 */
export function generateHourlyChartData(activities: HourlyActivity[]): Array<Record<string, number | string>> {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data = hours.map((hour) => {
    const hourData: Record<string, number | string> = { hour: `${hour}시` };

    activities
      .filter((activity) => activity.hour === hour)
      .forEach((activity) => {
        if (!hourData[activity.category]) {
          hourData[activity.category] = 0;
        }
        (hourData[activity.category] as number) += activity.duration / 60; // 시간 단위로 변환
      });

    return hourData;
  });

  // 데이터가 있는 시간대만 반환
  return data.filter((d) => {
    const hasData = Object.keys(d).length > 1; // hour 외에 다른 키가 있는지
    return hasData;
  });
}
