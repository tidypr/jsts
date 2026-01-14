import { NextResponse } from 'next/server';
import { createGuestUser } from '@/shared/actions/user.actions';

/**
 * 게스트 User 생성 API
 * POST /api/auth/guest
 */
export async function POST() {
  try {
    const result = await createGuestUser();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error creating guest user:', error);
    return NextResponse.json(
      { success: false, error: '게스트 사용자 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
