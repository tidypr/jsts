import { Friend } from './friendSchema';

/**
 * Mock 친구 데이터
 * 실제 서비스에서는 DB에서 가져올 데이터
 * 
 * NOTE: Server Actions에서 이 배열을 직접 수정하고 있으므로,
 * 서버 재시작 시 초기 상태로 리셋됩니다.
 * 실제 DB 구현 시 Prisma 등으로 교체 필요.
 */
export const mockFriends: Friend[] = [
  {
    id: 'friend-1',
    userId: 'user-1',
    friendId: 'user-2',
    friendName: '김철수',
    friendEmail: 'kim@example.com',
    friendAvatar: '',
    status: 'accepted',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'friend-2',
    userId: 'user-1',
    friendId: 'user-3',
    friendName: '이영희',
    friendEmail: 'lee@example.com',
    friendAvatar: '',
    status: 'accepted',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'friend-3',
    userId: 'user-1',
    friendId: 'user-4',
    friendName: '박민수',
    friendEmail: 'park@example.com',
    friendAvatar: '',
    status: 'accepted',
    createdAt: new Date('2024-02-01'),
  },
];

/**
 * Mock 친구 요청 데이터 (받은 요청)
 */
export const mockFriendRequests: Friend[] = [
  {
    id: 'request-1',
    userId: 'user-5',
    friendId: 'user-1',
    friendName: '최지훈',
    friendEmail: 'choi@example.com',
    friendAvatar: '',
    status: 'pending',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'request-2',
    userId: 'user-6',
    friendId: 'user-1',
    friendName: '정수진',
    friendEmail: 'jung@example.com',
    friendAvatar: '',
    status: 'pending',
    createdAt: new Date('2024-03-05'),
  },
];

/**
 * Mock 보낸 친구 요청 데이터
 */
export const mockSentRequests: Friend[] = [
  {
    id: 'sent-1',
    userId: 'user-1',
    friendId: 'user-7',
    friendName: '강민지',
    friendEmail: 'kang@example.com',
    friendAvatar: '',
    status: 'pending',
    createdAt: new Date('2024-03-10'),
  },
];

/**
 * Mock 사용자 검색 데이터
 * 친구 요청을 보낼 수 있는 사용자 목록
 */
export const mockUsers = [
  {
    id: 'user-8',
    name: '송하늘',
    email: 'song@example.com',
    avatar: '',
  },
  {
    id: 'user-9',
    name: '윤바다',
    email: 'yoon@example.com',
    avatar: '',
  },
  {
    id: 'user-10',
    name: '임별',
    email: 'lim@example.com',
    avatar: '',
  },
];
