'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Quote } from 'lucide-react';

interface QuoteData {
  author: string;
  authorProfile: string;
  message: string;
  date: string; // YYYY-MM-DD
}

const STORAGE_KEY = 'daily-quote';
const API_URL = 'https://korean-advice-open-api.vercel.app/api/advice';

export default function DailyQuote() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // 오늘 날짜 (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];

        // 로컬 스토리지에서 저장된 명언 가져오기
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
          const parsedQuote: QuoteData = JSON.parse(stored);

          // 저장된 날짜가 오늘이면 그대로 사용
          if (parsedQuote.date === today) {
            setQuote(parsedQuote);
            setIsLoading(false);
            return;
          }
        }

        // 새로운 명언 가져오기
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error('명언을 가져오는데 실패했습니다.');
        }

        const data = await response.json();
        const newQuote: QuoteData = {
          author: data.author,
          authorProfile: data.authorProfile,
          message: data.message,
          date: today,
        };

        // 로컬 스토리지에 저장
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuote));
        setQuote(newQuote);
      } catch (error) {
        console.error('명언 가져오기 실패:', error);

        // 에러 발생 시 기본 명언 표시
        setQuote({
          author: '에이브러햄 링컨',
          authorProfile: '미국 16대 대통령',
          message:
            '반드시 이겨야 하는 건 아니지만 진실할 필요는 있다. 반드시 성공해야 하는 건 아니지만, 소신을 가지고 살아야 할 필요는 있다.',
          date: new Date().toISOString().split('T')[0],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, []);

  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>로딩 중...</p>
        </div>
      </Card>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <Card className='relative overflow-hidden bg-muted p-6'>
      {/* 배경 아이콘 */}
      <div className='absolute right-4 top-4 opacity-10'>
        <Quote className='h-16 w-16' />
      </div>

      {/* 헤더 */}
      <div className='mb-4 flex items-center gap-2'>
        <Quote className='h-4 w-4 text-[#22c55e]' />
        <h3 className='font-meFdium text-sm text-[#22c55e]'>오늘의 문장</h3>
      </div>

      {/* 문장 내용 */}
      <blockquote className='relative mb-4 text-base leading-relaxed'>
        {quote.message}
      </blockquote>

      {/* 저자 정보 */}
      <div className='flex items-center justify-end gap-1 text-sm text-muted-foreground'>
        {quote.author}
        {/* <span className=''></span> */}
        {/* {quote.authorProfile && (
          <>
            <span>•</span>
            <span>{quote.authorProfile}</span>
          </>
        )} */}
      </div>
    </Card>
  );
}
