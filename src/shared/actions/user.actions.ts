'use server';

import { prisma } from '@/shared/lib/prisma/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Create User
export async function createUser(data: {
  email: string;
  name?: string;
  password?: string;
  image?: string;
  bio?: string;
}) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        image: data.image,
        bio: data.bio,
      },
    });
    revalidatePath('/');
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}

// Create Guest User
export async function createGuestUser() {
  try {
    // 게스트 유저 수를 카운트하여 다음 번호 생성
    const guestCount = await prisma.user.count({
      where: { isGuest: true },
    });

    const guestNumber = String(guestCount + 1).padStart(3, '0'); // 001, 002, ...
    const timestamp = Date.now();
    const email = `GUEST_${guestNumber}@${timestamp}.com`;
    const name = `게스트 ${guestNumber}`;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        isGuest: true,
      },
    });

    revalidatePath('/');
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create guest user',
    };
  }
}

// Get User by ID
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        phases: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
    };
  }
}

// Get User by Email
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        phases: true,
      },
    });
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
    };
  }
}

// Get All Users
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { phases: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, data: users };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get users',
    };
  }
}

// Update User
export async function updateUser(
  id: string,
  data: {
    email?: string;
    name?: string;
    password?: string;
    image?: string;
    bio?: string;
  },
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    revalidatePath('/');
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

// Delete User
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/');
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}

// Check if email exists
export async function checkEmailExists(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return { success: true, exists: !!user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check email',
    };
  }
}

// Get Current User Profile
export async function getCurrentUserProfile() {
  try {
    const session = await auth();
    console.log('🔍 getCurrentUserProfile - session:', JSON.stringify(session, null, 2));

    if (!session?.user?.email) {
      console.log('❌ getCurrentUserProfile - No session or email');
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    console.log('🔍 Looking up user with email:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        points: {
          select: {
            amount: true,
          },
        },
      },
    });

    console.log('🔍 User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('✅ User data:', { id: user.id, email: user.email, name: user.name });
    }

    if (!user) {
      console.log('❌ getCurrentUserProfile - User not found in DB');
      return {
        success: false,
        error: 'User not found',
      };
    }

    // totalPoints 계산 (Point 테이블에서 합산)
    const totalPoints = user.points.reduce((sum, point) => sum + point.amount, 0);

    return {
      success: true,
      data: {
        ...user,
        totalPoints,
      },
    };
  } catch (error) {
    console.error('❌ getCurrentUserProfile - Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get current user',
    };
  }
}

// Update Current User Profile
export async function updateCurrentUserProfile(data: {
  name?: string;
  image?: string;
  bio?: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        image: data.image,
        bio: data.bio,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    revalidatePath('/profile');
    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}
