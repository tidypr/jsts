import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { updateCurrentUserProfile } from '@/shared/actions/user.actions';
import {
  updateProfileNameSchema,
  updateProfileImageSchema,
} from '@/features/profile/profile.schema';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 },
      );
    }

    const body = await request.json();

    // 이름 또는 이미지 업데이트인지 확인
    const validatedData: { name?: string; image?: string } = {};

    if (body.name !== undefined) {
      const nameValidation = updateProfileNameSchema.safeParse({
        name: body.name,
      });
      if (!nameValidation.success) {
        return NextResponse.json(
          {
            success: false,
            error: nameValidation.error.issues[0]?.message || 'Invalid name',
          },
          { status: 400 },
        );
      }
      validatedData.name = nameValidation.data.name;
    }

    if (body.image !== undefined) {
      const imageValidation = updateProfileImageSchema.safeParse({
        image: body.image,
      });
      if (!imageValidation.success) {
        return NextResponse.json(
          {
            success: false,
            error:
              imageValidation.error.issues[0]?.message || 'Invalid image URL',
          },
          { status: 400 },
        );
      }
      validatedData.image = imageValidation.data.image;
    }

    // 프로필 업데이트
    const result = await updateCurrentUserProfile(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
      },
      { status: 500 },
    );
  }
}
