import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { createUser, getUserByEmail } from '@/shared/actions/user.actions';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/shared/lib/prisma/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Authorize - credentials received:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Authorize - Missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        console.log('🔍 Authorize - User lookup:', {
          found: !!user,
          email: user?.email,
          isGuest: user?.isGuest,
        });

        if (!user) {
          console.log('❌ Authorize - User not found');
          return null;
        }

        // 게스트 사용자는 비밀번호 체크 없이 로그인 허용
        if (user.isGuest) {
          console.log('✅ Authorize - Guest user login allowed');
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }

        // 일반 사용자는 비밀번호 체크
        if (!user.password) {
          console.log('❌ Authorize - User has no password');
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        console.log('🔐 Authorize - Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          console.log('❌ Authorize - Invalid password');
          return null;
        }

        console.log('✅ Authorize - Login successful');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
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
        console.log('SignIn attempt for user:', user.email);
        const existing = await getUserByEmail(user.email as string);
        console.log('Existing user lookup result:', existing);

        if (!existing.data) {
          // user
          const newUser = await createUser({
            email: user.email as string,
            name: user.name as string,
            image: user.image as string,
          });
          console.log('New user created:', newUser);
          // 중요: 생성된 DB의 실제 UUID를 user 객체에 할당
          if (newUser.data) {
            user.id = newUser.data.id;
            console.log('Assigned new user ID:', user.id);
          } else {
            console.error('Failed to create user:', newUser.error);
            return false;
          }
        } else {
          // 기존 유저가 있다면 DB의 실제 UUID를 할당
          user.id = existing.data.id;
          console.log('Assigned existing user ID:', user.id);
        }
        return true;
      } catch (error) {
        console.log(`error: ${error}`);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // 로그인 시점에 user 객체에 담긴 DB ID를 토큰에 저장
      if (account && user) {
        token.id = user.id;
        console.log('JWT callback - storing user ID in token:', user.id);
      }
      // OAuth accessToken을 토큰에 저장
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔐 Session callback - token:', JSON.stringify(token, null, 2));
      console.log('🔐 Session callback - session before:', JSON.stringify(session, null, 2));
      
      // 토큰에 저장된 DB ID를 세션 유저 객체에 주입
      if (session.user && token.id) {
        session.user.id = token.id as string;
        console.log('✅ Session callback - user ID assigned:', session.user.id);
      } else {
        console.log('❌ Session callback - Missing session.user or token.id');
      }
      
      // accessToken을 세션에 추가
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      
      console.log('🔐 Session callback - session after:', JSON.stringify(session, null, 2));
      return session;
    },
  },

  session: { strategy: 'jwt' },
});
