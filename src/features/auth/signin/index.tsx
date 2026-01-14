'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { LucideEye, LucideEyeOff } from 'lucide-react';
import Link from 'next/link';
import { signInWithEmail, signInAsGuest } from '../api';
import { signinSchema } from '../auth.schemas';
import { URL } from '@/shared/constants/url';
import GoogleLoginBtn from './GoogleLoginBtn';
import GithubLoginBtn from './GithubLoginBtn';
import { SigninFormData } from '@/shared/types/auth';

export default function SigninPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: SigninFormData) => {
    console.log('로그인 시도:', data.email);
    setIsLoading(true);
    setErrorMessage(null);

    const result = await signInWithEmail(data);
    console.log('로그인 결과:', result);

    if (result.success) {
      console.log('로그인 성공, /stats로 이동');
      router.push(URL.HOME);
    } else {
      console.log('로그인 실패:', result.error);
      setErrorMessage(result.error?.message || '로그인에 실패했습니다.');
    }

    setIsLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('폼 제출 시도');
    handleSubmit(onSubmit)(e);
  };

  const handleGuestLogin = async () => {
    console.log('게스트 로그인 시도');
    setIsLoading(true);
    setErrorMessage(null);

    const result = await signInAsGuest();

    if (result.success) {
      console.log('게스트 로그인 성공, /home으로 이동');
      router.push(URL.HOME);
    } else {
      console.log('게스트 로그인 실패:', result.error);
      setErrorMessage(result.error?.message || '게스트 로그인에 실패했습니다.');
    }

    setIsLoading(false);
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
      <div className='w-full rounded-2xl border border-zinc-800 bg-background p-8 shadow-md sm:w-96'>
        {/* Content */}
        <div className='flex flex-1 flex-col'>
          <form onSubmit={handleFormSubmit} className='flex-1'>
            <h1 className='mb-2 text-2xl font-bold text-foreground'>
              다시 오신 것을 환영합니다!
            </h1>
            <p className='mb-8 text-muted-foreground'>
              목표를 향해 달려볼까요?
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

            {/* Keep logged in & Forgot password */}
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Controller
                  name='keepLoggedIn'
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <Checkbox
                      id='keep-logged-in'
                      data-testid='keep-logged-in'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label
                  htmlFor='keep-logged-in'
                  className='cursor-pointer text-sm text-muted-foreground'
                >
                  로그인 유지
                </label>
              </div>
              <Link
                href='#'
                className='text-sm text-primary hover:text-primary/80'
              >
                비밀번호 재설정
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type='submit'
              disabled={isLoading}
              className='mb-6 w-full rounded-2xl bg-green-500 py-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
              data-testid='login-button'
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {/* Social Login */}
          <div className='space-y-3'>
            <GoogleLoginBtn isLoading={isLoading} />
            <GithubLoginBtn isLoading={isLoading} />
          </div>

          {/* Sign Up Link */}
          <div className='mt-8 flex items-center justify-center gap-2 text-center'>
            <span className='text-sm text-muted-foreground'>
              계정이 없으신가요?
            </span>
            <Link
              href={URL.AUTH.SIGNUP}
              className='text-sm font-semibold hover:text-primary/80'
              data-testid='signup-link'
            >
              회원가입
            </Link>
          </div>

          {/* Continue as Guest */}
          <button
            type='button'
            onClick={handleGuestLogin}
            disabled={isLoading}
            className='mt-6 text-sm text-muted-foreground underline disabled:opacity-50'
            data-testid='guest-button'
          >
            {isLoading ? '게스트 로그인 중...' : '게스트로 계속하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
