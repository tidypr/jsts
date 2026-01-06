'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LucideEye, LucideEyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { signUpWithEmail, signInWithSocial } from '../api';
import { signupSchema } from '../auth.schemas';
import type { SignupFormData, SocialProvider } from '@/shared/types/auth';
import { URL } from '@/shared/constants/url';
import Image from 'next/image';

/**
 * 회원가입 페이지 컴포넌트
 *
 * 사용자의 닉네임, 이메일, 비밀번호를 입력받아 회원가입을 처리하는 UI 컴포넌트입니다.
 *
 * @returns {JSX.Element} 회원가입 페이지 UI
 */
export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  /**
   * 회원가입 핸들러
   */
  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await signUpWithEmail(data);

    if (result.success) {
      console.log('회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.');
      router.push(URL.AUTH.SIGNIN);
    } else {
      setErrorMessage(result.error?.message || '회원가입에 실패했습니다.');
    }

    setIsLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(onSubmit)(e);
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await signInWithSocial(provider);

    if (!result.success) {
      setErrorMessage(result.error?.message || '소셜 로그인에 실패했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
      <div className='w-full rounded-2xl border border-zinc-800 bg-background p-8 shadow-md sm:w-96'>
        {/* Content */}
        <div className='flex flex-1 flex-col'>
          <form onSubmit={handleFormSubmit} className='flex-1'>
            <h1 className='mb-2 text-2xl font-bold text-foreground'>
              함께 공부 시작하기
            </h1>
            <p className='mb-8 whitespace-pre-line text-muted-foreground'>
              {`오늘 목표를 설정하고,\n친구들과 함께 성장하세요.`}
            </p>

            {/* Error Message */}
            {errorMessage && (
              <div className='mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500'>
                {errorMessage}
              </div>
            )}

            {/* Email Input */}
            <div className='mb-4'>
              <label className='mb-2 block text-sm text-muted-foreground'>
                이메일 <span className='text-sm text-red-500'>*</span>
              </label>
              <Input
                type='email'
                placeholder='user@example.com'
                className='border-border bg-secondary text-foreground'
                data-testid='email-input'
                {...register('email')}
              />
              {errors.email && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className='mb-4'>
              <label className='mb-2 block text-sm text-muted-foreground'>
                비밀번호 <span className='text-sm text-red-500'>*</span>
              </label>
              <div className='relative'>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  className='border-border bg-secondary pr-10 text-foreground'
                  data-testid='password-input'
                  {...register('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                  data-testid='password-toggle'
                >
                  {showPassword ? (
                    <LucideEyeOff className='h-5 w-5' />
                  ) : (
                    <LucideEye className='h-5 w-5' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password Confirm Input */}
            <div className='mb-6'>
              <label className='mb-2 block text-sm text-muted-foreground'>
                비밀번호 확인 <span className='text-sm text-red-500'>*</span>
              </label>
              <div className='relative'>
                <Input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder='••••••••'
                  className='border-border bg-secondary pr-10 text-foreground'
                  data-testid='password-confirm-input'
                  {...register('passwordConfirm')}
                />
                <button
                  type='button'
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                  data-testid='password-confirm-toggle'
                >
                  {showPasswordConfirm ? (
                    <LucideEyeOff className='h-5 w-5' />
                  ) : (
                    <LucideEye className='h-5 w-5' />
                  )}
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>

            {/* Signup Button */}
            <Button
              type='submit'
              disabled={isLoading}
              className='mb-6 w-full rounded-2xl bg-green-500 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
              data-testid='signup-button'
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </Button>

            {/* Social Login */}
            <div className='space-y-3'>
              <Button
                type='button'
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                variant='outline'
                className='flex w-full items-center justify-center gap-2 rounded-2xl border-border bg-secondary py-4 text-foreground disabled:opacity-50'
                data-testid='github-login-button'
              >
                <Image
                  src={'https://authjs.dev/img/providers/github.svg'}
                  alt='GitHub Logo'
                  width={20}
                  height={20}
                  className='h-4 w-4 invert'
                />
                Continue with GitHub
              </Button>
              <Button
                type='button'
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                variant='outline'
                className='flex w-full items-center justify-center gap-2 rounded-2xl border-border bg-secondary py-4 text-foreground disabled:opacity-50'
                data-testid='google-login-button'
              >
                <Image
                  src={'https://authjs.dev/img/providers/google.svg'}
                  alt='Google Logo'
                  width={20}
                  height={20}
                  className='h-4 w-4'
                />
                Continue with Google
              </Button>
            </div>

            {/* Sign In Link */}
            <div className='mt-8 flex items-center justify-center gap-2 text-center'>
              <span className='text-sm text-muted-foreground'>
                이미 계정이 있으신가요?
              </span>
              <Link
                href={URL.AUTH.SIGNIN}
                className='text-sm font-semibold hover:text-primary/80'
                data-testid='signin-link'
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
