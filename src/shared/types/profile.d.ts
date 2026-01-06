export interface Profile {
  /** 사용자 ID (UUID) */
  id: string;
  /** 사용자 이름 */
  name: string | null;
  /** 사용자 이메일 */
  email: string;
  /** 프로필 이미지 URL */
  image: string | null;
  /** 사용자 소개 */
  bio: string | null;
  /** 생성 일시 */
  createdAt: Date;
  /** 업데이트 일시 */
  updatedAt: Date;
}

export interface MenuItem {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  customComponent?: React.ReactNode;
}

export interface ProfilePageProps {
  profile: Profile | null | undefined;
}
