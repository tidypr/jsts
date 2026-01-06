import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      console.log(`isLoggedIn: ${isLoggedIn}`);

      // public page 정의
      const isPublicPage =
        request.nextUrl.pathname.startsWith('/auth/login') ||
        request.nextUrl.pathname.startsWith('/onboarding') ||
        request.nextUrl.pathname === '/';

      if (isPublicPage) {
        return true;
      }

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
