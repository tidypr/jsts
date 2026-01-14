'use client';

import { Profile } from '@/features/profile/Profile';
import { ProfilePageProps } from '@/features/profile/profile.type';

export default function ProfilePage({
  profile: initialProfile,
}: ProfilePageProps) {
  return (
    <>
      <Profile profile={initialProfile} />
    </>
  );
}
