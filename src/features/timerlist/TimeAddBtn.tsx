import { Timer } from 'lucide-react';

export default function TimeAddBtn({ ...props }: { onClick: () => void }) {
  return (
    <>
      <button
        {...props}
        className='fixed bottom-24 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e] shadow-lg transition-colors hover:bg-[#22c55e]/90'
      >
        <Timer className='h-6 w-6 text-black' />
      </button>
    </>
  );
}
