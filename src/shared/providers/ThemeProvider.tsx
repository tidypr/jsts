'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * 애플리케이션의 테마 관리를 위한 Provider 컴포넌트
 * next-themes를 사용하여 다크모드/라이트모드 등의 테마를 관리
 *
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @returns {React.ReactElement} 테마 프로바이더로 감싸진 자식 컴포넌트
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
