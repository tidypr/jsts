import type { PhaseData } from './types';

/**
 * Segment 시간 계산 (분)
 */
export function calculateSegmentDuration(segment: {
  startTime: Date | string;
  endTime: Date | string;
}): number {
  const start = new Date(segment.startTime);
  const end = new Date(segment.endTime);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Phase 총 시간 계산 (분)
 */
export function calculatePhaseDuration(phase: PhaseData): number {
  if (!phase.segments || phase.segments.length === 0) return 0;
  return phase.segments
    .filter((segment): segment is typeof segment & { endTime: Date } => segment.endTime !== null)
    .reduce(
      (total, segment) => total + calculateSegmentDuration(segment),
      0,
    );
}

/**
 * 여러 Phase의 총 시간 계산 (분)
 */
export function calculateTotalDuration(phases: PhaseData[]): number {
  return phases.reduce(
    (total, phase) => total + calculatePhaseDuration(phase),
    0,
  );
}

/**
 * 분을 시간으로 변환
 */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

/**
 * 시간 포맷팅 (예: "2시간 5분")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

/**
 * 차트용 기본 색상 (카테고리가 있을 때 DB에서 가져온 색상 사용)
 * 레거시 지원용 임시 맵핑
 */
export const CATEGORY_COLORS: Record<string, string> = {};
export const CATEGORY_LABELS: Record<string, string> = {};

/**
 * 월별 데이터 집계
 */
export interface MonthlyData {
  month: string;
  monthName: string;
  totalMinutes: number;
  totalHours: number;
  phaseCount: number;
  segmentCount: number;
  categoryBreakdown: Record<string, number>;
}

export function aggregateMonthlyData(
  phases: PhaseData[],
  year: number,
): MonthlyData[] {
  const monthlyMap = new Map<string, MonthlyData>();

  // 12개월 초기화
  for (let month = 0; month < 12; month++) {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthName = `${month + 1}월`;
    monthlyMap.set(monthKey, {
      month: monthKey,
      monthName,
      totalMinutes: 0,
      totalHours: 0,
      phaseCount: 0,
      segmentCount: 0,
      categoryBreakdown: {},
    });
  }

  // 데이터 집계
  phases.forEach((phase) => {
    if (!phase.endTime) return;
    const phaseDate = new Date(phase.endTime);
    if (phaseDate.getFullYear() !== year) return;

    const month = phaseDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const data = monthlyMap.get(monthKey);

    if (data) {
      const duration = calculatePhaseDuration(phase);
      data.totalMinutes += duration;
      data.totalHours = minutesToHours(data.totalMinutes);
      data.phaseCount += 1;
      data.segmentCount += phase.segments?.length || 0;

      // 카테고리별 집계
      const category = phase.title || '기타';
      data.categoryBreakdown[category] =
        (data.categoryBreakdown[category] || 0) + duration;
    }
  });

  return Array.from(monthlyMap.values());
}

/**
 * 카테고리별 데이터 집계
 */
export interface CategoryData {
  category: string;
  totalMinutes: number;
  totalHours: number;
  phaseCount: number;
  percentage: number;
}

export function aggregateCategoryData(phases: PhaseData[]): CategoryData[] {
  const categoryMap = new Map<string, Omit<CategoryData, 'percentage'>>();

  phases.forEach((phase) => {
    const category = phase.title || '기타';
    const duration = calculatePhaseDuration(phase);

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        totalMinutes: 0,
        totalHours: 0,
        phaseCount: 0,
      });
    }

    const data = categoryMap.get(category)!;
    data.totalMinutes += duration;
    data.totalHours = minutesToHours(data.totalMinutes);
    data.phaseCount += 1;
  });

  // 총 시간 계산
  const totalMinutes = Array.from(categoryMap.values()).reduce(
    (sum, data) => sum + data.totalMinutes,
    0,
  );

  // 퍼센트 계산
  return Array.from(categoryMap.values())
    .map((data) => ({
      ...data,
      percentage:
        totalMinutes > 0
          ? Math.round((data.totalMinutes / totalMinutes) * 100)
          : 0,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}

/**
 * 연간 통계
 */
export interface YearlyStats {
  year: number;
  totalMinutes: number;
  totalHours: number;
  totalPhases: number;
  totalSegments: number;
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
  averageMinutesPerDay: number;
  averageMinutesPerMonth: number;
  mostProductiveMonth: string;
  mostUsedCategory: string;
}

export function calculateYearlyStats(
  phases: PhaseData[],
  year: number,
): YearlyStats {
  // 해당 연도의 Phase만 필터링
  const yearPhases = phases.filter(
    (phase) => phase.endTime && new Date(phase.endTime).getFullYear() === year,
  );

  // 기본 통계
  const totalMinutes = calculateTotalDuration(yearPhases);
  const totalHours = minutesToHours(totalMinutes);
  const totalPhases = yearPhases.length;
  const totalSegments = yearPhases.reduce(
    (sum, phase) => sum + (phase.segments?.length || 0),
    0,
  );

  // 월별 데이터
  const monthlyData = aggregateMonthlyData(yearPhases, year);

  // 카테고리별 데이터
  const categoryData = aggregateCategoryData(yearPhases);

  // 일평균 (365일 기준)
  const averageMinutesPerDay = Math.round(totalMinutes / 365);

  // 월평균
  const averageMinutesPerMonth = Math.round(totalMinutes / 12);

  // 가장 생산적인 월 찾기
  const mostProductiveMonthData = monthlyData.reduce((max, current) =>
    current.totalMinutes > max.totalMinutes ? current : max,
  );
  const mostProductiveMonth = mostProductiveMonthData.monthName;

  // 가장 많이 사용한 카테고리
  const mostUsedCategory =
    categoryData.length > 0 ? categoryData[0].category : 'other';

  return {
    year,
    totalMinutes,
    totalHours,
    totalPhases,
    totalSegments,
    monthlyData,
    categoryData,
    averageMinutesPerDay,
    averageMinutesPerMonth,
    mostProductiveMonth,
    mostUsedCategory,
  };
}
