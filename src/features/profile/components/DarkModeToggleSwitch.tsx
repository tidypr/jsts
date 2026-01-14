'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Switch } from '@/shared/components/ui/switch';

interface DarkModeToggleSwitchProps {
  className?: string;
}

export default function DarkModeToggleSwitch({
  className,
}: DarkModeToggleSwitchProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /**
   * 컴포넌트 마운트 상태 설정
   * - SSR 환경에서 hydration mismatch를 방지하기 위해 마운트 후에만 렌더링
   * - 초기 설정은 시스템 테마를 따름 (defaultTheme='system')
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  // SSR 환경에서는 null 반환 (hydration mismatch 방지)
  if (!mounted) {
    return null;
  }

  // resolvedTheme: 실제로 적용된 테마 (system이면 OS 설정에 따라 dark/light로 해석됨)
  const isDark = resolvedTheme === 'dark';

  return (
    <Switch
      checked={isDark}
      onCheckedChange={handleToggle}
      className={className}
      data-testid='dark-mode-toggle-switch'
      aria-label='다크모드 토글'
    />
  );
}
