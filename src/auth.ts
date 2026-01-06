import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { createUser, getUserByEmail } from '@/shared/actions/user.actions';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_CLIENT_ID!,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // async signIn({ user, account, profile, email, credentials }) {
    //   console.log(user, account, profile, email, credentials);

    async signIn({ user }) {
      try {
        const existing = await getUserByEmail(user.email as string);
        console.log(existing);
        if (!existing.data) {
          // user
          const newUser = await createUser({
            email: user.email as string,
            name: user.name as string,
            image: user.image as string,
          });
          // 중요: 생성된 DB의 실제 UUID를 user 객체에 할당
          if (newUser.data) {
            user.id = newUser.data.id;
          }
        } else {
          // 기존 유저가 있다면 DB의 실제 UUID를 할당
          user.id = existing.data.id;
        }
        return true;
      } catch (error) {
        console.log(`error: ${error}`);
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      // 로그인 시점에 user 객체에 담긴 DB ID를 토큰에 저장
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 토큰에 저장된 DB ID를 세션 유저 객체에 주입
      if (session.user && token.sub) {
        // session.user.id = token.sub;
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: { strategy: 'jwt' },
});
