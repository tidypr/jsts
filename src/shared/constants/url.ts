/**
 * 애플리케이션 전체에서 사용되는 URL 상수
 */
export const URL = {
  // Auth 관련 URL
  AUTH: {
    SIGNIN: '/auth/login',
    SIGNUP: '/auth/register',
    SIGNOUT: '/auth/signout',
  },
  // 메인 페이지
  HOME: '/',
  ONBOARDING: '/onboarding',
  STATS: '/stats',
  TIMER: '/timer',
  PROFILE: '/profile',
  SOSIAL: '/sosial',
} as const;
