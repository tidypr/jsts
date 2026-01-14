import { useEffect, useState } from 'react';

export default function CountDown({
  handleConfirm,
}: {
  handleConfirm: () => void;
}) {
  const [countDown, setCountDown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountDown((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (countDown === 0) {
      handleConfirm();
    }
  }, [countDown, handleConfirm]);

  return (
    <>
      <span className='flex justify-end text-end text-sm text-muted-foreground'>
        {`${countDown}초 후 자동으로 타이머 목록으로 이동합니다.`}
      </span>
    </>
  );
}
