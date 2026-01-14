import {
  ChevronRight,
  Trophy,
  Target,
  CreditCard,
  Settings,
  FileText,
  Star,
} from 'lucide-react';
import DarkModeToggleSwitch from './DarkModeToggleSwitch';
import { ProfileMenuItem } from '../profile.type';

const menuItems: ProfileMenuItem[] = [
  {
    icon: <FileText className='h-5 w-5 text-[#22c55e]' />,
    title: '내 피드',
    description: '공유한 피드 목록 보기',
    onClick: () => (window.location.href = '/my-feed'),
  },
  {
    icon: <Star className='h-5 w-5 text-[#22c55e]' />,
    title: '포인트 히스토리',
    description: '획득한 포인트 확인',
    onClick: () => (window.location.href = '/profile/point-history'),
  },
  {
    icon: <Trophy className='h-5 w-5 text-[#22c55e]' />,
    title: '배지 컬렉션',
    description: '12개 획득',
    onClick: () => console.log('Badges Collection clicked'),
  },
  {
    icon: <Target className='h-5 w-5 text-[#22c55e]' />,
    title: '목표 관리',
    description: '일간, 주간, 월간 목표 설정',
    onClick: () => (window.location.href = '/profile/goals'),
  },
  {
    icon: <CreditCard className='h-5 w-5 text-muted-foreground' />,
    title: '구독',
    onClick: () => console.log('Subscription clicked'),
  },
  {
    icon: <Settings className='h-5 w-5 text-muted-foreground' />,
    title: '다크 모드',
    customComponent: <DarkModeToggleSwitch />,
  },
];

export default function ProfileMenuList() {
  return (
    <div className='flex cursor-pointer flex-col gap-3' data-testid='menu-list'>
      {menuItems.map((item, index) => (
        <li
          key={index}
          onClick={item.onClick}
          className='flex items-center gap-4 rounded-2xl bg-secondary px-4 py-4 transition-colors hover:bg-secondary'
          data-testid={`menu-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className='flex h-10 w-10 items-center justify-center'>
            {item.icon}
          </div>
          <div className='flex flex-1 flex-col items-start'>
            <p className='text-base font-semibold text-foreground'>
              {item.title}
            </p>
            {item.description && (
              <p className='text-sm text-muted-foreground'>
                {item.description}
              </p>
            )}
          </div>
          {item.customComponent ? (
            item.customComponent
          ) : (
            <ChevronRight className='h-5 w-5 text-muted-foreground' />
          )}
        </li>
      ))}
    </div>
  );
}
