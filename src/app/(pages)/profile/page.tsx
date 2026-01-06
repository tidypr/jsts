import Profile from '@/features/profile';
import { getCurrentUserProfile } from '@/shared/actions/user.actions';

export default async function page() {
  const profileResult = await getCurrentUserProfile();
  const profile = profileResult.success ? profileResult.data : null;
  return (
    <>
      <Profile profile={profile} />
    </>
  );
}
