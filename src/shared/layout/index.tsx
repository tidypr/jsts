import { ReactNode } from 'react';

/**
 * AppLayout 컴포넌트
 *
 * 애플리케이션의 루트 레이아웃을 감싸는 컴포넌트입니다.
 * 전역 상태 관리, 공통 레이아웃 요소, 컨텍스트 프로바이더 등을
 * 포함할 수 있도록 설계되었습니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {ReactNode} props.children - 자식 컴포넌트
 * @returns {JSX.Element} AppLayout 컴포넌트
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
