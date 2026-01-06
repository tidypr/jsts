'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar';
import {
  ArrowLeft,
  Bell,
  Camera,
  Pencil,
  Calendar,
  Star,
  Trophy,
  Target,
  CreditCard,
  Settings,
  ChevronRight,
} from 'lucide-react';
import type {
  MenuItem,
  Profile,
  ProfilePageProps,
} from '@/shared/types/profile';
import DarkModeToggleSwitch from './DarkModeToggleSwitch';
import LogoutBtn from './LogoutBtn';

export default function Profile({
  profile: initialProfile,
}: ProfilePageProps): JSX.Element {
  const [profile] = useState<Profile | null>(initialProfile || null);

  const menuItems: MenuItem[] = [
    {
      icon: <Star className='h-5 w-5 text-[#22c55e]' />,
      title: '포인트 히스토리',
      description: '획득한 포인트 확인',
      onClick: () => console.log('Points History clicked'),
    },
    {
      icon: <Trophy className='h-5 w-5 text-[#22c55e]' />,
      title: '배지 컬렉션',
      description: '12개 획득',
      onClick: () => console.log('Badges Collection clicked'),
    },
    {
      icon: <Target className='h-5 w-5 text-[#22c55e]' />,
      title: '목표 관리',
      description: '목표 설정',
      onClick: () => console.log('Goal Management clicked'),
    },
    {
      icon: <CreditCard className='h-5 w-5 text-muted-foreground' />,
      title: '구독',
      onClick: () => console.log('Subscription clicked'),
    },
    {
      icon: <Settings className='h-5 w-5 text-muted-foreground' />,
      title: '앱 설정',
      customComponent: <DarkModeToggleSwitch />,
    },
  ];

  const handleBack = () => {
    console.log('Back clicked');
  };

  const handleNotification = () => {
    console.log('Notification clicked');
  };

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
  };

  const handleEditName = () => {
    console.log('Edit name clicked');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account clicked');
  };

  const formatJoinDate = (date: Date): string => {
    try {
      return format(date, 'MMM yyyy');
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div
      className='flex min-h-screen flex-col bg-background'
      data-testid='profile-page'
    >
      {/* 헤더 */}
      <header
        className='flex items-center justify-between px-4 py-4'
        data-testid='profile-header'
      >
        <button
          onClick={handleBack}
          className='flex h-10 w-10 items-center justify-center'
          aria-label='뒤로가기'
          data-testid='back-button'
        >
          <ArrowLeft className='h-6 w-6 text-foreground' />
        </button>
        <h1
          className='text-lg font-semibold text-foreground'
          data-testid='profile-title'
        >
          내 프로필
        </h1>
        <button
          onClick={handleNotification}
          className='flex h-10 w-10 items-center justify-center'
          aria-label='알림'
          data-testid='notification-button'
        >
          <Bell className='h-6 w-6 text-foreground' />
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className='flex flex-1 flex-col px-4 pb-4'>
        {/* 프로필이 없는 경우 (로그인 필요) */}
        {!profile && (
          <div
            className='flex flex-1 items-center justify-center'
            data-testid='profile-error'
          >
            <p className='text-destructive'>로그인이 필요합니다.</p>
          </div>
        )}

        {/* 프로필 데이터 표시 */}
        {profile && (
          <>
            {/* 프로필 섹션 */}
            <div
              className='flex flex-col items-center py-6'
              data-testid='profile-section'
            >
              {/* 아바타 */}
              <div className='relative' data-testid='profile-avatar-container'>
                <Avatar className='h-24 w-24'>
                  {profile.image && (
                    <AvatarImage
                      src={profile.image}
                      alt='프로필 사진'
                      data-testid='profile-avatar-image'
                    />
                  )}
                </Avatar>
                <button
                  onClick={handleEditProfile}
                  className='absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600'
                  aria-label='프로필 사진 편집'
                  data-testid='edit-profile-button'
                >
                  <Camera className='h-5 w-5' />
                </button>
              </div>

              {/* 사용자 이름 */}
              <div
                className='mt-4 flex items-center gap-2'
                data-testid='profile-name'
              >
                <h2 className='text-2xl font-bold text-foreground'>
                  {profile.name || '익명 사용자'}
                </h2>
                <button
                  onClick={handleEditName}
                  className='flex h-6 w-6 items-center justify-center'
                  aria-label='이름 편집'
                  data-testid='edit-name-button'
                >
                  <Pencil className='h-4 w-4 text-[#22c55e]' />
                </button>
              </div>

              {/* 이메일 */}
              <p
                className='mt-1 text-sm text-muted-foreground'
                data-testid='profile-email'
              >
                {profile.email || '이메일 없음'}
              </p>

              {/* 가입일 */}
              <div
                className='mt-2 flex items-center gap-1'
                data-testid='profile-joined'
              >
                <Calendar className='h-4 w-4 text-[#22c55e]' />
                <span className='text-sm text-muted-foreground'>
                  가입일 {formatJoinDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* 통계 및 메뉴 */}
        {profile && (
          <>
            {/* 통계 섹션 */}
            <div className='flex gap-3 pb-6' data-testid='stats-section'>
              {/* 포인트 카드 */}
              <div
                className='flex flex-1 flex-col items-center justify-center rounded-2xl bg-muted py-6'
                data-testid='points-card'
              >
                <p className='text-3xl font-bold text-[#22c55e]'>{0}</p>
                <p className='mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  포인트
                </p>
              </div>

              {/* 배지 카드 */}
              <div
                className='flex flex-1 flex-col items-center justify-center rounded-2xl bg-muted py-6'
                data-testid='badges-card'
              >
                <p className='text-3xl font-bold text-foreground'>0</p>
                <p className='mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  배지
                </p>
              </div>
            </div>

            {/* 메뉴 리스트 */}
            <div className='flex flex-col gap-3' data-testid='menu-list'>
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  onClick={item.onClick}
                  className='flex items-center gap-4 rounded-2xl bg-muted px-4 py-4 transition-colors hover:bg-muted/80'
                  data-testid={`menu-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className='flex h-10 w-10 items-center justify-center'>
                    {item.icon}
                  </div>
                  <div className='flex flex-1 flex-col items-start'>
                    <p className='text-base font-semibold text-foreground'>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className='text-sm text-muted-foreground'>
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.customComponent ? (
                    item.customComponent
                  ) : (
                    <ChevronRight className='h-5 w-5 text-muted-foreground' />
                  )}
                </li>
              ))}
            </div>

            {/* 로그아웃 버튼 */}
            <div className='mt-6 flex flex-col gap-4'>
              <LogoutBtn />

              {/* 계정 삭제 */}
              <button
                onClick={handleDeleteAccount}
                className='text-sm font-medium text-muted-foreground hover:text-foreground'
                data-testid='delete-account-button'
              >
                계정 삭제
              </button>
            </div>

            {/* 버전 정보 */}
            <div className='mt-4 flex justify-center pb-2'>
              <p
                className='text-xs text-muted-foreground'
                data-testid='app-version'
              >
                0.0.1(Beta)
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
