'use client';

import { useEffect, useState } from 'react';

interface StartCountdownProps {
  onComplete: () => void;
}

export default function StartCountdown({ onComplete }: StartCountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className='flex h-[400px] w-full flex-col items-center justify-center'>
      <div className='text-center'>
        <div className='mb-4 text-8xl font-bold text-primary animate-pulse'>
          {count}
        </div>
        <div className='text-xl text-muted-foreground'>
          타이머 시작 준비 중...
        </div>
      </div>
    </div>
  );
}
