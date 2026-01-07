import { useEffect, useState } from 'react';

export default function CountDown({
  handleConfirm,
}: {
  handleConfirm: () => void;
}) {
  const [countDown, setCountDown] = useState(1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountDown((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (countDown === 1) {
      handleConfirm();
    }
  }, [countDown, handleConfirm]);

  return (
    <>
      <span className='flex justify-end text-end text-sm text-muted-foreground'>
        {`${countDown}초 후 자동 저장됩니다.`}
      </span>
    </>
  );
}
