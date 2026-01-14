export default function CheckCircle() {
  return (
    <div className='max-w-100vh flex h-32 w-32 items-center justify-center'>
      {/* Animated background circles */}
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        <div className='animate-ping-slow absolute h-32 w-32 rounded-full border-2 border-[#22c55e]/20' />
        <div className='animate-ping-slower absolute h-80 w-80 rounded-full border-2 border-[#22c55e]/10' />
        <div className='animate-ping-slowest absolute h-96 w-96 rounded-full border-2 border-[#22c55e]/5' />
      </div>

      {/* Content */}
      <div className='z-10 max-w-md space-y-8 text-center'>
        {/* Check mark with circle */}
        <div className='max-w-1/3 h-32 w-32'>
          <div className='animate-scale-in absolute inset-0 rounded-full bg-[#22c55e]/10' />
          <div className='animate-scale-in-delay-1 absolute inset-2 rounded-full bg-[#22c55e]/20' />
          <div className='animate-scale-in-delay-2 absolute inset-4 flex items-center justify-center rounded-full bg-[#22c55e]'>
            <svg
              className='animate-draw-check h-16 w-16 text-background'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={3}
                d='M5 13l4 4L19 7'
                strokeDasharray='24'
                strokeDashoffset='24'
                style={{
                  animation: 'draw-check 0.5s ease-out 0.5s forwards',
                }}
              />
            </svg>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes ping-slower {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes ping-slowest {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.7);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes draw-check {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fade-in-up-delay {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-ping-slower {
          animation: ping-slower 2s cubic-bezier(0, 0, 0.2, 1) 0.5s infinite;
        }

        .animate-ping-slowest {
          animation: ping-slowest 2s cubic-bezier(0, 0, 0.2, 1) 1s infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }

        .animate-scale-in-delay-1 {
          animation: scale-in 0.4s ease-out 0.1s both;
        }

        .animate-scale-in-delay-2 {
          animation: scale-in 0.4s ease-out 0.2s both;
        }

        .animate-draw-check {
          animation: draw-check 0.5s ease-out 0.5s forwards;
        }

        .animate-fade-in-up-delay {
          animation: fade-in-up-delay 0.5s ease-out 0.7s both;
        }

        .animate-fade-in-up-delay-2 {
          animation: fade-in-up-delay 0.5s ease-out 0.9s both;
        }

        .animate-fade-in-up-delay-3 {
          animation: fade-in-up-delay 0.5s ease-out 1.1s both;
        }
      `}</style>
    </div>
  );
}
