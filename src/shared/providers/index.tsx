/**
 * 루트 레이아웃을 감싸는 프로바이더 컴포넌트
 * 추후 필요한 프로바이더들을 추가할 수 있는 기본 구조 제공
 *
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @returns {React.ReactElement} 프로바이더로 감싸진 자식 컴포넌트
 */
export default function Providers({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
