'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar';
import {
  Camera,
  Pencil,
  Calendar,
  Coins,
  PiggyBank,
  Medal,
  Trophy,
} from 'lucide-react';
import type { Profile, ProfilePageProps } from './profile.type';
import LogoutBtn from './components/LogoutBtn';
import { Card } from '@/shared/components/ui/card';
import { AvatarFallback } from '@radix-ui/react-avatar';
import Link from 'next/link';
import ProfileMenuList from './components/ProfileMenuList';
import { Badge } from '@/shared/components/ui/badge';
import { EditNameDialog } from './components/EditNameDialog';
import { EditProfileImageDialog } from './components/EditProfileImageDialog';
import { useRouter } from 'next/navigation';

export function Profile({
  profile: initialProfile,
}: ProfilePageProps): JSX.Element {
  const [profile, setProfile] = useState<Profile | null>(
    initialProfile || null,
  );
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isEditImageOpen, setIsEditImageOpen] = useState(false);
  const router = useRouter();

  const handleEditProfile = () => {
    setIsEditImageOpen(true);
  };

  const handleEditName = () => {
    setIsEditNameOpen(true);
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
  };

  const handleNameUpdateSuccess = (newName: string) => {
    if (profile) {
      setProfile({ ...profile, name: newName });
    }
    router.refresh();
  };

  const handleImageUpdateSuccess = (newImageUrl: string) => {
    if (profile) {
      setProfile({ ...profile, image: newImageUrl });
    }
    router.refresh();
  };

  const formatJoinDate = (date: Date): string => {
    try {
      return format(date, 'yyyy. MM. dd');
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div
      className='flex min-h-screen flex-col bg-background'
      data-testid='profile-page'
    >
      {/* 메인 컨텐츠 */}
      <main className='flex flex-1 flex-col pb-4'>
        {/* 프로필이 없는 경우 (로그인 필요) */}
        {!profile && (
          <div
            className='flex flex-1 flex-col items-center justify-center'
            data-testid='profile-error'
          >
            <Link href='/auth/login' className='text-destructive text-white'>
              로그인 페이지로 이동
            </Link>
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
              <div className='relative' data-testid='profile-avatar-container '>
                <Avatar className='h-24 w-24 border-4 border-[#22c55e]/30 bg-[#22c55e]/10'>
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
                <Badge className='flex gap-1 rounded-xl bg-secondary/50 px-2 text-sm text-muted-foreground'>
                  <Calendar className='h-4 w-4 text-[#22c55e]' />
                  가입일 {formatJoinDate(profile.createdAt)}
                </Badge>
              </div>
            </div>
          </>
        )}

        {/* 통계 및 메뉴 */}
        {profile && (
          <>
            {/* 통계 섹션 */}
            <div className='flex gap-3 pb-3' data-testid='stats-section'>
              {/* 포인트 카드 */}
              <>
                <Card className='relative h-44 flex-1 overflow-hidden bg-muted p-4'>
                  {/* 배경 아이콘 */}
                  <div className='absolute right-4 top-4 opacity-10'>
                    <Coins className='h-16 w-16' />
                  </div>

                  <div className='flex flex-col justify-between gap-4'>
                    {/* 헤더 */}
                    <div className='mb-4 flex items-center gap-2'>
                      <PiggyBank className='h-6 w-6 text-[#22c55e]' />
                      <h3 className='text-sm font-medium text-foreground'>
                        보유 포인트
                      </h3>
                    </div>

                    {/* <div className='relative h-44 mb-4 text-base leading-relaxed'> */}
                    <div className='flex flex-col gap-1 text-sm text-muted-foreground'>
                      <div className='flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale'>
                        <p className='text-3xl font-bold text-foreground'>
                          {profile.totalPoints.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      포인트를 모아보세요!
                    </span>
                  </div>
                  {/* </div> */}
                </Card>
                <Card className='relative h-44 flex-1 overflow-hidden bg-muted p-4'>
                  {/* 배경 아이콘 */}
                  <div className='absolute right-4 top-4 opacity-10'>
                    <Trophy className='h-16 w-16' />
                  </div>

                  <div className='flex flex-col justify-between gap-4'>
                    {/* 헤더 */}
                    <div className='mb-4 flex items-center gap-2'>
                      <Medal className='h-6 w-6 text-[#22c55e]' />
                      <h3 className='text-sm font-medium text-foreground'>
                        보유 뱃지
                      </h3>
                    </div>

                    {/* <div className='relative mb-4 text-base leading-relaxed'> */}
                    <div className='flex flex-col gap-1 text-sm text-muted-foreground'>
                      <div className='flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale'>
                        <Avatar>
                          <AvatarImage
                            src='https://authjs.dev/img/providers/gitlab.svg'
                            alt='@shadcn'
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarImage
                            src='https://authjs.dev/img/adapters/prisma.svg'
                            alt='@maxleiter'
                          />
                          <AvatarFallback>LR</AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarImage
                            src='https://authjs.dev/img/adapters/supabase.svg'
                            alt='@evilrabbit'
                          />
                          <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      업적을 달성했습니다!
                    </span>
                  </div>
                  {/* </div> */}
                </Card>
              </>
            </div>

            {/* 메뉴 리스트 */}
            <ProfileMenuList />

            {/* 로그아웃 버튼 */}
            <div className='mt-6 flex flex-col gap-4'>
              <LogoutBtn />

              {/* 회원 탈퇴 */}
              <button
                onClick={handleDeleteAccount}
                className='text-sm font-medium text-muted-foreground hover:text-foreground'
                data-testid='delete-account-button'
              >
                회원 탈퇴
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

      {/* 다이얼로그 */}
      {profile && (
        <>
          <EditNameDialog
            open={isEditNameOpen}
            onOpenChange={setIsEditNameOpen}
            currentName={profile.name}
            onSuccess={handleNameUpdateSuccess}
          />
          <EditProfileImageDialog
            open={isEditImageOpen}
            onOpenChange={setIsEditImageOpen}
            currentImage={profile.image}
            onSuccess={handleImageUpdateSuccess}
          />
        </>
      )}
    </div>
  );
}
