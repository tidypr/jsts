'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface CustomModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function CustomModal({
  isOpen,
  children,
  className,
}: CustomModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  // Portal 컨테이너 설정
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  // ESC 키 방지
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  // 바디 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !portalContainer) return null;

  // Portal을 사용하여 body에 직접 렌더링
  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-2'
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
      onMouseDown={(e) => {
        // Backdrop 직접 클릭만 방지 (모달 외부)
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onClick={(e) => {
        // Backdrop 직접 클릭만 방지 (모달 외부)
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`relative max-h-[95vh] w-full max-w-[90vw] overflow-auto rounded-lg border bg-background p-6 shadow-lg sm:max-w-md ${className}`}
      >
        {children}
      </div>
    </div>,
    portalContainer,
  );
}
