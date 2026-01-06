'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import BottomNavigator from './BottomNavigator';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // BottomNavigator를 숨길 경로들
  const hideBottomNavigator =
    pathname === '/' ||
    pathname?.includes('onboarding') ||
    pathname?.includes('auth');

  return (
    <main className='mx-auto flex min-h-screen w-full flex-col items-center justify-center md:w-3/4'>
      <div
        className={`w-full px-2 ${hideBottomNavigator ? 'flex-1' : 'mb-16 flex-1'}`}
      >
        {children}
      </div>
      {!hideBottomNavigator && <BottomNavigator />}
    </main>
  );
}
