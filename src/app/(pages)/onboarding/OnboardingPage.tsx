'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import onBoardingImg from '@/shared/assets/images/test-onboard.gif';

/**
 * 온보딩 페이지 컴포넌트
 *
 * 처음 방문한 사용자에게 앱의 미리보기를 3단계로 보여줍니다.
 * localStorage에 완료 여부를 저장하여 재방문 시 건너뛸 수 있습니다.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onboardingSteps = [
    {
      title: '시간을 기록하세요',
      description: '타이머로 활동 시간을 쉽게 기록하고 관리하세요',
    },
    {
      title: '통계로 확인하세요',
      description: '일간, 주간, 월간 통계로 시간 사용 패턴을 분석하세요',
    },
    {
      title: '목표를 달성하세요',
      description: '체계적인 시간 관리로 생산성을 극대화하세요',
    },
  ];

  const totalSteps = onboardingSteps.length;

  const completeOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_completed', 'true');
      // 쿠키에도 저장 (서버에서 확인 가능하도록)
      document.cookie = 'onboarding_completed=true; path=/; max-age=31536000'; // 1년
    }
    router.push('/auth/login');
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      // 다음 단계로
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계: 온보딩 완료
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className='relative flex h-screen flex-col'
      data-testid='onboarding-page'
    >
      {/* Skip 버튼 */}
      <div className='absolute right-4 top-4 z-10'>
        <button
          onClick={handleSkip}
          className='text-sm text-muted-foreground hover:text-foreground'
        >
          건너뛰기
        </button>
      </div>

      {/* 미리보기 이미지 - 전체 화면 */}
      <div className='relative mt-12 h-1/2 w-full'>
        <Image
          src={onBoardingImg}
          alt='앱 미리보기'
          fill
          className='rounded-2xl border border-muted object-cover'
          priority
          // unoptimized
        />
      </div>

      {/* 하단: 정보 및 버튼 */}
      <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent py-8'>
        <div className='mx-auto w-full max-w-md space-y-6'>
          {/* 텍스트 정보 */}
          <div className='space-y-2 text-center'>
            <h2 className='text-2xl font-bold'>
              {onboardingSteps[currentStep].title}
            </h2>
            <p className='text-muted-foreground'>
              {onboardingSteps[currentStep].description}
            </p>
          </div>

          {/* 인디케이터 */}
          <div className='flex justify-center gap-2'>
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* 다음/시작 버튼 */}
          <button
            onClick={handleNext}
            className='w-full rounded-md bg-[#22c55e] p-2'
            data-testid='onboarding-next-button'
          >
            {currentStep < totalSteps - 1 ? '다음' : '시작하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
