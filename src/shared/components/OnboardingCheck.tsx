'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * 온보딩 체크 컴포넌트
 * 
 * 앱 첫 접속 시 localStorage를 확인하여
 * 온보딩을 완료하지 않은 경우 온보딩 페이지로 리다이렉트합니다.
 */
export default function OnboardingCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 온보딩 관련 페이지나 인증 페이지에서는 체크하지 않음
    if (
      pathname?.includes('onboarding') ||
      pathname?.includes('auth')
    ) {
      return;
    }

    // localStorage와 쿠키 모두 체크 (클라이언트 사이드에서만 실행)
    const localStorageCompleted = localStorage.getItem('onboarding_completed');
    const cookieCompleted = document.cookie
      .split('; ')
      .find(row => row.startsWith('onboarding_completed='))
      ?.split('=')[1] === 'true';

    // 온보딩을 완료하지 않았다면 온보딩 페이지로 리다이렉트
    if (!localStorageCompleted && !cookieCompleted) {
      router.push('/onboarding');
    }
  }, [pathname, router]);

  return null; // UI를 렌더링하지 않음
}
