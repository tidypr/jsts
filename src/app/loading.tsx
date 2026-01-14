'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotation((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 각도 계산
  // 분침: 1초에 2바퀴 = 100회(1000ms / 10ms) 동안 720도 회전 = 7.2도씩 증가
  const minuteDeg = rotation * 7.2 - 90;

  // 시침: 1초에 1바퀴 = 100회(1000ms / 10ms) 동안 360도 회전 = 3.6도씩 증가
  const hourDeg = rotation * 3.6 - 90;

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        {/* 시계 */}
        <div className='relative h-24 w-24'>
          {/* 시계 테두리 */}
          <div className='absolute inset-0 rounded-full border-4 border-[#22c55e] p-4' />

          {/* 시계 중심점 */}
          <div className='absolute left-1/2 top-1/2 z-30 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22c55e]' />

          {/* 시침 */}
          <div
            className='absolute left-1/2 top-1/2 origin-left'
            style={{
              transform: `translate(-2px, -1.5px) rotate(${hourDeg}deg)`,
              width: '28px',
              height: '3px',
              backgroundColor: '#22c55e99',
            }}
          />

          {/* 분침 */}
          <div
            className='absolute left-1/2 top-1/2 origin-left'
            style={{
              transform: `translate(-2px, -1px) rotate(${minuteDeg}deg)`,
              width: '36px',
              height: '2px',
              backgroundColor: '#22c55e99',
              borderRadius: '2px',
            }}
          />

          {/* 시계 숫자 표시 (12, 3, 6, 9) */}
          <div className='absolute left-1/2 top-1 -translate-x-1/2 text-xs font-bold text-gray-600'>
            12
          </div>
          <div className='absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600'>
            3
          </div>
          <div className='absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600'>
            6
          </div>
          <div className='absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600'>
            9
          </div>
        </div>

        <p className='animate-pulse text-lg text-gray-300'>
          잠시만 기다려 주세요...
        </p>
      </div>
    </div>
  );
}
