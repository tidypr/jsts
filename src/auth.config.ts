import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // 쿠키에서 온보딩 완료 여부 확인
      const onboardingCompleted = request.cookies.get('onboarding_completed')?.value === 'true';

      console.log(`isLoggedIn: ${isLoggedIn}, onboardingCompleted: ${onboardingCompleted}, pathname: ${pathname}`);

      // 온보딩 페이지는 항상 접근 가능
      if (pathname.startsWith('/onboarding')) {
        return true;
      }

      // 온보딩을 완료하지 않았으면 온보딩으로 리다이렉트
      if (!onboardingCompleted) {
        return Response.redirect(new URL('/onboarding', request.url));
      }

      // 인증 페이지는 온보딩 완료 후 접근 가능
      const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');
      if (isAuthPage) {
        return true;
      }

      // 루트 경로는 인증 필요
      if (pathname === '/') {
        if (!isLoggedIn) {
          return Response.redirect(new URL('/auth/login', request.url));
        }
        return true;
      }

      // 그 외 페이지는 로그인 필요
      if (isLoggedIn) {
        return true;
      }

      return false;
    },
  },
  providers: [],
  pages: {
    signIn: '/auth/login',
  },
} satisfies NextAuthConfig;
