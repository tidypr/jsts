'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Calendar, Settings, Plus, Share2 } from 'lucide-react';

/**
 * 헤더 설정 타입
 */
type HeaderConfig = {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcons?: React.ReactNode[];
};

/**
 * 경로별 헤더 설정
 */
const HEADER_CONFIG: Record<string, HeaderConfig> = {
  '/home': {
    title: '홈',
    rightIcons: [
      <button
        key='search'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Search className='h-5 w-5' />
      </button>,
      <button
        key='bell'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Bell className='h-5 w-5' />
      </button>,
    ],
  },
  '/record': {
    title: '기록',
    rightIcons: [
      <button
        key='plus'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Plus className='h-5 w-5' />
      </button>,
      <button
        key='settings'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Settings className='h-5 w-5' />
      </button>,
    ],
  },
  '/timer': {
    title: '타이머',
    rightIcons: [
      <button
        key='plus'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Plus className='h-5 w-5' />
      </button>,
      <button
        key='settings'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Settings className='h-5 w-5' />
      </button>,
    ],
  },
  '/stats': {
    title: '통계',
    rightIcons: [
      <button
        key='calendar'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Calendar className='h-5 w-5' />
      </button>,
      <button
        key='share'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Share2 className='h-5 w-5' />
      </button>,
    ],
  },
  '/social': {
    title: '소셜',
    rightIcons: [
      <button
        key='search'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Search className='h-5 w-5' />
      </button>,
      <button
        key='bell'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Bell className='h-5 w-5' />
      </button>,
    ],
  },
  '/profile': {
    title: '프로필',
    rightIcons: [
      <button
        key='edit'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Bell className='h-6 w-6 text-foreground' />
      </button>,
      <button
        key='settings'
        className='rounded-md p-2 transition-colors hover:bg-accent'
      >
        <Settings className='h-5 w-5' />
      </button>,
    ],
  },
};

/**
 * Static Header 컴포넌트
 * 각 페이지별로 고정된 헤더를 표시합니다.
 */
export function MobileStaticHeader() {
  const pathname = usePathname();

  const config = HEADER_CONFIG[pathname];

  // 설정이 없는 경로는 헤더를 표시하지 않음
  if (!config) {
    return null;
  }

  return (
    <>
      <header className='fixed left-0 top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-background px-4'>
        {/* 왼쪽: 페이지 제목 */}
        <div className='flex items-center'>
          <h1 className='text-lg font-semibold'>{config.title}</h1>
        </div>

        {/* 오른쪽: 아이콘들 */}
        <div className='flex items-center gap-1'>
          {config.rightIcons?.map((icon, index) => (
            <React.Fragment key={index}>{icon}</React.Fragment>
          ))}
        </div>
      </header>
      {/* 헤더 높이만큼 공간 확보 */}
      <div className='mb-4 h-14' />
    </>
  );
}
