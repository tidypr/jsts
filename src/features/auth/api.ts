import { signIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { register } from '@/shared/actions/auth.actions';
import type {
  SigninFormData,
  SignupFormData,
  SocialProvider,
  AuthError,
} from '@/shared/types/auth';

/**
 * 이메일/비밀번호로 로그인
 *
 * @param data - 로그인 폼 데이터
 * @returns 성공 여부와 에러 정보
 */
export async function signInWithEmail(data: SigninFormData): Promise<{
  success: boolean;
  error?: AuthError;
}> {
  try {
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      return {
        success: false,
        error: {
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error during signInWithEmail:', error);
    return {
      success: false,
      error: {
        message: '로그인 중 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 이메일/비밀번호로 회원가입
 *
 * @param data - 회원가입 폼 데이터
 * @returns 성공 여부와 에러 정보
 */
export async function signUpWithEmail(data: SignupFormData): Promise<{
  success: boolean;
  error?: AuthError;
}> {
  try {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('name', data.email.split('@')[0]); // 이메일에서 이름 추출

    const result = await register({ message: '', status: false }, formData);

    if (!result.status) {
      return {
        success: false,
        error: {
          message: result.message,
        },
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error during signUp:', error);
    return {
      success: false,
      error: {
        message: '회원가입 중 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 소셜 로그인
 *
 * @param provider - 소셜 로그인 제공자 (google, apple, github)
 * @returns 성공 여부와 에러 정보
 */
export async function signInWithSocial(provider: SocialProvider): Promise<{
  success: boolean;
  error?: AuthError;
}> {
  try {
    await signIn(provider, {
      callbackUrl: '/stats',
    });

    return { success: true };
  } catch (error) {
    console.error('Unexpected error during signInWithSocial:', error);

    return {
      success: false,
      error: {
        message: '소셜 로그인 중 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 게스트로 로그인
 *
 * @returns 성공 여부와 에러 정보
 */
export async function signInAsGuest(): Promise<{
  success: boolean;
  error?: AuthError;
}> {
  try {
    const response = await fetch('/api/auth/guest', {
      method: 'POST',
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: {
          message: result.error || '게스트 로그인 중 오류가 발생했습니다.',
        },
      };
    }

    // 게스트 User 생성 후 자동 로그인
    const signInResult = await signIn('credentials', {
      redirect: false,
      email: result.data.email,
      password: 'guest', // 게스트는 비밀번호가 없지만 signIn 호출을 위해 더미 값 사용
    });

    if (signInResult?.error) {
      return {
        success: false,
        error: {
          message: '게스트 로그인 중 오류가 발생했습니다.',
        },
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error during signInAsGuest:', error);
    return {
      success: false,
      error: {
        message: '게스트 로그인 중 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 로그아웃
 *
 * @returns 성공 여부와 에러 정보
 */
export async function signOut(): Promise<{
  success: boolean;
  error?: AuthError;
}> {
  try {
    await nextAuthSignOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.error('Unexpected error during signOut:', error);
    return {
      success: false,
      error: {
        message: '로그아웃 중 오류가 발생했습니다.',
      },
    };
  }
}
