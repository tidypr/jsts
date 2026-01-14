/**
 * 시간대 정보 인터페이스
 */
export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  type: 'filled' | 'gap';
  phaseId?: string; // filled인 경우에만
}

/**
 * Phase 데이터 타입
 */
export interface PhaseWithSegments {
  id: string;
  category?: string | null;
  startTime: Date | null;
  endTime: Date | null;
  note: string | null;
  segments?: {
    id: string;
    startTime: Date;
    endTime: Date | null;
  }[];
}

/**
 * 특정 날짜의 빈 시간대를 정각 단위로 분석
 *
 * @param phases - 해당 날짜의 Phase 배열
 * @param targetDate - 분석할 날짜
 * @returns TimeSlot 배열 (filled와 gap이 섞여있음)
 */
export function analyzeTimeGaps(
  phases: PhaseWithSegments[],
  targetDate: Date,
): TimeSlot[] {
  const result: TimeSlot[] = [];

  // 해당 날짜의 시작과 끝
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  // 모든 세그먼트를 시간순으로 정렬
  const allSegments: { start: Date; end: Date; phaseId: string }[] = [];

  phases.forEach((phase) => {
    if (!phase.segments) return;

    phase.segments.forEach((segment) => {
      if (!segment.endTime) return; // 완료되지 않은 세그먼트 제외

      const segmentStart = new Date(segment.startTime);
      const segmentEnd = new Date(segment.endTime);

      // 해당 날짜 범위 내의 세그먼트만 포함
      if (
        segmentStart >= dayStart &&
        segmentEnd <= dayEnd
      ) {
        allSegments.push({
          start: segmentStart,
          end: segmentEnd,
          phaseId: phase.id,
        });
      }
    });
  });

  // 시간순으로 정렬
  allSegments.sort((a, b) => a.start.getTime() - b.start.getTime());

  // 빈 시간대 분석
  let currentTime = new Date(dayStart);

  allSegments.forEach((segment) => {
    const segmentStart = segment.start;
    const segmentEnd = segment.end;

    // 현재 시간과 세그먼트 시작 사이에 gap이 있으면
    if (currentTime < segmentStart) {
      // gap을 정각 단위로 분할
      const gaps = splitGapByHour(currentTime, segmentStart);
      result.push(...gaps);
    }

    // filled 세그먼트 추가
    result.push({
      startTime: segmentStart,
      endTime: segmentEnd,
      type: 'filled',
      phaseId: segment.phaseId,
    });

    // 현재 시간 업데이트
    currentTime = new Date(segmentEnd);
  });

  // 마지막 세그먼트 이후부터 자정까지의 gap
  if (currentTime < dayEnd) {
    const gaps = splitGapByHour(currentTime, dayEnd);
    result.push(...gaps);
  }

  return result;
}

/**
 * 빈 시간대를 정각 단위로 분할
 * 예: 12:10 ~ 14:30 -> [12:10~13:00, 13:00~14:00, 14:00~14:30]
 */
function splitGapByHour(start: Date, end: Date): TimeSlot[] {
  const gaps: TimeSlot[] = [];
  let current = new Date(start);

  while (current < end) {
    // 다음 정각 계산
    const nextHour = new Date(current);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);

    // gap의 끝 시간 결정 (다음 정각 또는 end 중 작은 값)
    const gapEnd = nextHour < end ? nextHour : end;

    // gap 추가 (최소 1분 이상인 경우만)
    if (gapEnd.getTime() - current.getTime() >= 60000) {
      gaps.push({
        startTime: new Date(current),
        endTime: new Date(gapEnd),
        type: 'gap',
      });
    }

    current = gapEnd;
  }

  return gaps;
}

/**
 * 시간 포맷팅 (HH:MM)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * 시간 간격 계산 (분 단위)
 */
export function calculateMinutes(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}
