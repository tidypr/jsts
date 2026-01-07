'use server';

import { GetRankInput, GetRankResponse, getRankInputSchema } from './rankSchema';
import { mockRankUsers } from './mockData';
import { z } from 'zod';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

export async function getRankAction(
  rawData: GetRankInput,
): Promise<ActionResult<GetRankResponse>> {
  try {
    // Validation - server side
    const validData = getRankInputSchema.parse(rawData);

    // Mock delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Filter by category if specified
    let filteredUsers = [...mockRankUsers];
    if (validData.category) {
      filteredUsers = filteredUsers.filter(
        (user) => user.category === validData.category,
      );
    }

    // Apply limit
    const limitedUsers = filteredUsers.slice(0, validData.limit);

    // Mock current user (assuming user id is '5')
    const myRank = mockRankUsers.find((user) => user.id === '5') || null;

    return {
      success: true,
      data: {
        ranks: limitedUsers,
        myRank,
        period: validData.period,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('순위 조회 실패:', error);
    return {
      success: false as const,
      error: '순위 조회 중 오류가 발생했습니다.',
    };
  }
}
