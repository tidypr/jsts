'use server';

import { signIn, signOut } from '@/auth';
import { prisma } from '@/shared/lib/prisma/prisma';
import bcrypt from 'bcryptjs';

export async function googleLoginAction() {
  await signIn('google', { redirectTo: '/profile' });
}

export async function githubLoginAction() {
  await signIn('github', { redirectTo: '/profile' });
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' });
}

export async function register(
  prevState: { message: string; status: boolean },
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (!email || !password) {
      return {
        message: '이메일과 비밀번호를 입력해주세요.',
        status: false,
      };
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        message: '이미 사용 중인 이메일입니다.',
        status: false,
      };
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      },
    });

    return {
      message: '회원가입이 완료되었습니다.',
      status: true,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      message: '회원가입 중 오류가 발생했습니다.',
      status: false,
    };
  }
}
