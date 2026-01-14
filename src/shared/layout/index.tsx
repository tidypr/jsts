'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import BottomNavigator from './BottomNavigator';
import { MobileStaticHeader } from './Header';
import OnboardingCheck from '@/shared/components/OnboardingCheck';
import { Toaster } from '@/shared/components/ui/sonner';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // header를 숨길 경로들
  const hideHeader =
    pathname === '/' ||
    pathname?.includes('onboarding') ||
    pathname?.includes('auth') ||
    pathname?.includes('timer/phase-inprogress') ||
    pathname?.includes('timer/phase-complete');

  // BottomNavigator를 숨길 경로들
  const hideBottomNavigator =
    pathname === '/' ||
    pathname?.includes('onboarding') ||
    pathname?.includes('auth') ||
    pathname?.includes('timer/phase-inprogress') ||
    pathname?.includes('timer/phase-complete');

  return (
    <>
      <OnboardingCheck />
      <Toaster />
      <main className='mx-auto flex min-h-screen w-full flex-col items-center justify-center md:w-3/4'>
        {!hideHeader && <MobileStaticHeader />}
        <div
          className={`w-full px-4 ${hideBottomNavigator ? 'flex-1' : 'flex-1 pb-20'}`}
        >
          {children}
        </div>
        {!hideBottomNavigator && <BottomNavigator />}
      </main>
    </>
  );
}
