import { getCurrentUserProfile } from '@/shared/actions/user.actions';
import ProfilePage from './ProfilePage';

export default async function Profile() {
  const profileResult = await getCurrentUserProfile();
  const profile = profileResult.success ? profileResult.data : null;

  return <ProfilePage profile={profile} />;
}
