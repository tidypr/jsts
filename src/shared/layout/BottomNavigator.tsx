'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, TrendingUp, Timer, Users, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * 하단 탭 네비게이터의 탭 아이템 타입
 */
interface TabItem {
  /** 탭 라벨 */
  label: string;
  /** 탭 경로 */
  path: string;
  /** 탭 아이콘 컴포넌트 */
  icon: LucideIcon;
}

/**
 * 하단 탭 네비게이터 탭 목록
 */
const TABS: TabItem[] = [
  { label: '홈', path: '/home', icon: Home },
  { label: '통계', path: '/stats', icon: TrendingUp },
  { label: '타이머', path: '/timer', icon: Timer },
  { label: '소셜', path: '/social', icon: Users },
  { label: '프로필', path: '/profile', icon: User },
];

/**
 * 하단 탭 네비게이터 컴포넌트
 *
 * 애플리케이션의 주요 페이지를 탐색할 수 있는 하단 네비게이션 바입니다.
 * Home, Stats, Timer, Community, Profile 5개의 탭을 제공하며,
 * 현재 페이지에 따라 활성 탭이 하이라이트됩니다.
 *
 * @returns {JSX.Element} 하단 탭 네비게이터
 */
export default function BottomNavigator(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * 탭 클릭 핸들러
   * 지정된 경로로 페이지를 이동합니다.
   *
   * @param {string} path - 이동할 경로
   */
  const handleTabClick = (path: string): void => {
    router.push(path);
  };

  /**
   * 현재 경로가 탭의 경로와 일치하는지 확인
   *
   * @param {string} tabPath - 확인할 탭의 경로
   * @returns {boolean} 일치 여부
   */
  const isActive = (tabPath: string): boolean => {
    return pathname === tabPath;
  };

  return (
    <nav
      className='fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-border px-4 py-3 opacity-100'
      data-testid='bottom-navigator'
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);

        return (
          <button
            key={tab.path}
            onClick={() => handleTabClick(tab.path)}
            className='flex flex-col items-center gap-1 transition-colors'
            data-testid={`tab-${tab.label.toLowerCase()}`}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              className={`h-6 w-6 ${
                active ? 'text-[#22c55e]' : 'text-muted-foreground'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                active ? 'text-[#22c55e]' : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
