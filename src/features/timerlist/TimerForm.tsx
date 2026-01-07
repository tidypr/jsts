// import { Input } from '@/shared/components/ui/input';
// import { Label } from '@radix-ui/react-label';
// import { ActivityCategory } from '.';

// const CATEGORIES: { value: ActivityCategory; label: string }[] = [
//   { value: 'study', label: '공부' },
//   { value: 'exercise', label: '운동' },
//   { value: 'reading', label: '독서' },
//   { value: 'coding', label: '코딩' },
//   { value: 'project', label: '프로젝트' },
//   { value: 'other', label: '기타' },
// ];

// export default function TimerForm({
//   handleSubmit,
//   onOpenChange,
//   title,
//   setTitle,
//   category,
//   setCategory,
//   color,
//   setColor,
//   hours,
//   setHours,
//   minutes,
//   setMinutes,
//   seconds,
//   setSeconds,
// }: {
//   handleSubmit: (e: React.FormEvent) => void;
//   onOpenChange: (open: boolean) => void;
// }) {
//   return (
//     <>
//       <form onSubmit={handleSubmit} className='space-y-4'>
//         {/* Title */}
//         <div className='space-y-2'>
//           <Label htmlFor='title'>제목</Label>
//           <Input
//             id='title'
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder='예: 수학 문제 풀이'
//             className='border-[#1f1f1f] bg-[#0a0a0a]'
//           />
//         </div>

//         {/* Category */}
//         <div className='space-y-2'>
//           <Label htmlFor='category'>카테고리</Label>
//           <select
//             id='category'
//             value={category}
//             onChange={(e) => setCategory(e.target.value as ActivityCategory)}
//             className='flex h-10 w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm'
//           >
//             {CATEGORIES.map((cat) => (
//               <option key={cat.value} value={cat.value}>
//                 {cat.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Color */}
//         <div className='space-y-2'>
//           <Label>색상</Label>
//           <div className='flex gap-2'>
//             {COLORS.map((c) => (
//               <button
//                 key={c}
//                 type='button'
//                 onClick={() => setColor(c)}
//                 className={`h-10 w-10 rounded-full transition-transform ${
//                   color === c
//                     ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black'
//                     : ''
//                 }`}
//                 style={{ backgroundColor: c }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Time */}
//         <div className='space-y-2'>
//           <Label>시간</Label>
//           <div className='flex gap-2'>
//             <div className='flex-1'>
//               <Input
//                 type='number'
//                 min='0'
//                 max='23'
//                 value={hours}
//                 onChange={(e) => setHours(e.target.value)}
//                 placeholder='시'
//                 className='border-[#1f1f1f] bg-[#0a0a0a]'
//               />
//             </div>
//             <div className='flex-1'>
//               <Input
//                 type='number'
//                 min='0'
//                 max='59'
//                 value={minutes}
//                 onChange={(e) => setMinutes(e.target.value)}
//                 placeholder='분'
//                 className='border-[#1f1f1f] bg-[#0a0a0a]'
//               />
//             </div>
//             <div className='flex-1'>
//               <Input
//                 type='number'
//                 min='0'
//                 max='59'
//                 value={seconds}
//                 onChange={(e) => setSeconds(e.target.value)}
//                 placeholder='초'
//                 className='border-[#1f1f1f] bg-[#0a0a0a]'
//               />
//             </div>
//           </div>
//         </div>

//         {/* Submit */}
//         <div className='flex gap-2'>
//           <Button
//             type='button'
//             variant='outline'
//             onClick={() => onOpenChange(false)}
//             className='flex-1'
//           >
//             취소
//           </Button>
//           <Button
//             type='submit'
//             className='flex-1 bg-[#22c55e] text-black hover:bg-[#22c55e]/90'
//           >
//             추가
//           </Button>
//         </div>
//       </form>
//     </>
//   );
// }
