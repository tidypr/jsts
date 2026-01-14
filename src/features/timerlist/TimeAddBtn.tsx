import { Plus } from 'lucide-react';

export default function TimeAddBtn({ ...props }: { onClick: () => void }) {
  return (
    <>
      <button
        {...props}
        className='fixed bottom-24 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#22c55e] shadow-lg transition-all hover:scale-110 hover:bg-[#22c55e]/90'
      >
        <Plus className='h-7 w-7 text-black' strokeWidth={3} />
      </button>
    </>
  );
}
