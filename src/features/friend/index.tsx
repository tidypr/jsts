'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import Tabs from '@/shared/components/commons/Tabs';
import {
  SendFriendRequestInput,
  sendFriendRequestSchema,
} from './friendSchema';
import { useFriends } from './hooks/useFriends';
import { useFriendRequests } from './hooks/useFriendRequests';
import { useSentRequests } from './hooks/useSentRequests';
import { useSendFriendRequest } from './hooks/useSendFriendRequest';
import { useRespondFriendRequest } from './hooks/useRespondFriendRequest';
import { useDeleteFriend } from './hooks/useDeleteFriend';

interface FriendProps {
  userId?: string;
}

export default function Friend({ userId }: FriendProps) {
  const [activeTab, setActiveTab] = useState('friends');

  // React Query hooks
  const { data: friends, isLoading: friendsLoading } = useFriends(userId || '');
  const { data: requests, isLoading: requestsLoading } = useFriendRequests(
    userId || '',
  );
  const { data: sentRequests, isLoading: sentLoading } = useSentRequests(
    userId || '',
  );

  const { mutate: sendRequest, isPending: sendingRequest } =
    useSendFriendRequest();
  const { mutate: respondRequest, isPending: respondingRequest } =
    useRespondFriendRequest();
  const { mutate: deleteFriend, isPending: deletingFriend } = useDeleteFriend();

  // Form for sending friend request
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SendFriendRequestInput>({
    resolver: zodResolver(sendFriendRequestSchema),
    defaultValues: {
      userId: userId || '',
      friendEmail: '',
    },
  });

  /**
   * 친구 요청 보내기 핸들러
   */
  const onSubmitRequest = (data: SendFriendRequestInput) => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    sendRequest(
      { ...data, userId },
      {
        onSuccess: () => {
          alert('친구 요청을 보냈습니다.');
          reset();
        },
        onError: (error) => {
          alert(error.message || '친구 요청 중 오류가 발생했습니다.');
        },
      },
    );
  };

  /**
   * 친구 요청 수락 핸들러
   */
  const handleAcceptRequest = (requestId: string) => {
    if (!userId) return;

    respondRequest(
      { requestId, userId, accept: true },
      {
        onSuccess: () => {
          alert('친구 요청을 수락했습니다.');
        },
        onError: (error) => {
          alert(error.message || '요청 수락 중 오류가 발생했습니다.');
        },
      },
    );
  };

  /**
   * 친구 요청 거절 핸들러
   */
  const handleRejectRequest = (requestId: string) => {
    if (!userId) return;

    respondRequest(
      { requestId, userId, accept: false },
      {
        onSuccess: () => {
          alert('친구 요청을 거절했습니다.');
        },
        onError: (error) => {
          alert(error.message || '요청 거절 중 오류가 발생했습니다.');
        },
      },
    );
  };

  /**
   * 친구 삭제 핸들러
   */
  const handleDeleteFriend = (friendId: string, friendName: string) => {
    if (!userId) return;

    if (confirm(`${friendName}님을 친구 목록에서 삭제하시겠습니까?`)) {
      deleteFriend(
        { friendId, userId },
        {
          onSuccess: () => {
            alert('친구를 삭제했습니다.');
          },
          onError: (error) => {
            alert(error.message || '친구 삭제 중 오류가 발생했습니다.');
          },
        },
      );
    }
  };

  /**
   * 탭 구성
   */
  const tabs = [
    { id: 'friends', label: '친구 목록' },
    { id: 'requests', label: '받은 요청' },
    { id: 'sent', label: '보낸 요청' },
    { id: 'add', label: '친구 추가' },
  ];

  return (
    <div className='min-h-screen pb-8 pt-6'>
      <div className='mx-auto max-w-2xl space-y-6'>
        <div className='flex items-center justify-center'>
          <h1 className='text-xl font-bold'>친구 관리</h1>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 친구 목록 탭 */}
        {activeTab === 'friends' && (
          <div className='space-y-4'>
            {friendsLoading ? (
              <Card className='p-6 text-center text-muted-foreground'>
                로딩 중...
              </Card>
            ) : friends && friends.length > 0 ? (
              friends.map((friend) => (
                <Card
                  key={friend.id}
                  className='flex items-center justify-between p-4'
                  data-testid={`friend-item-${friend.id}`}
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/20 text-xl'>
                      👤
                    </div>
                    <div>
                      <h3 className='font-semibold'>{friend.friendName}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {friend.friendEmail}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      handleDeleteFriend(friend.id, friend.friendName)
                    }
                    disabled={deletingFriend}
                    className='text-red-500 hover:bg-red-50'
                    data-testid={`delete-friend-${friend.id}`}
                  >
                    삭제
                  </Button>
                </Card>
              ))
            ) : (
              <Card className='p-8 text-center'>
                <p className='text-muted-foreground'>아직 친구가 없습니다.</p>
                <p className='mt-2 text-sm text-muted-foreground'>
                  친구 추가 탭에서 친구를 추가해보세요!
                </p>
              </Card>
            )}
          </div>
        )}

        {/* 받은 요청 탭 */}
        {activeTab === 'requests' && (
          <div className='space-y-4'>
            {requestsLoading ? (
              <Card className='p-6 text-center text-muted-foreground'>
                로딩 중...
              </Card>
            ) : requests && requests.length > 0 ? (
              requests.map((request) => (
                <Card
                  key={request.id}
                  className='flex items-center justify-between p-4'
                  data-testid={`request-item-${request.id}`}
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-xl'>
                      ✉️
                    </div>
                    <div>
                      <h3 className='font-semibold'>{request.friendName}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {request.friendEmail}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={respondingRequest}
                      className='bg-[#22c55e] hover:bg-[#22c55e]/90'
                      data-testid={`accept-request-${request.id}`}
                    >
                      수락
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={respondingRequest}
                      data-testid={`reject-request-${request.id}`}
                    >
                      거절
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className='p-8 text-center'>
                <p className='text-muted-foreground'>받은 요청이 없습니다.</p>
              </Card>
            )}
          </div>
        )}

        {/* 보낸 요청 탭 */}
        {activeTab === 'sent' && (
          <div className='space-y-4'>
            {sentLoading ? (
              <Card className='p-6 text-center text-muted-foreground'>
                로딩 중...
              </Card>
            ) : sentRequests && sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <Card
                  key={request.id}
                  className='flex items-center justify-between p-4'
                  data-testid={`sent-item-${request.id}`}
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 text-xl'>
                      ⏳
                    </div>
                    <div>
                      <h3 className='font-semibold'>{request.friendName}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {request.friendEmail}
                      </p>
                    </div>
                  </div>
                  <span className='text-sm text-muted-foreground'>대기 중</span>
                </Card>
              ))
            ) : (
              <Card className='p-8 text-center'>
                <p className='text-muted-foreground'>보낸 요청이 없습니다.</p>
              </Card>
            )}
          </div>
        )}

        {/* 친구 추가 탭 */}
        {activeTab === 'add' && (
          <Card className='p-6'>
            <form
              onSubmit={handleSubmit(onSubmitRequest)}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <Label className='text-sm text-muted-foreground'>
                  친구 이메일
                </Label>
                <Input
                  type='email'
                  {...register('friendEmail')}
                  placeholder='friend@example.com'
                  className='border-[#1f1f1f]'
                  data-testid='friend-email-input'
                />
                {errors.friendEmail && (
                  <p className='text-sm text-red-500'>
                    {errors.friendEmail.message}
                  </p>
                )}
              </div>

              <Button
                type='submit'
                className='w-full bg-[#22c55e] py-6 font-semibold text-black hover:bg-[#22c55e]/90'
                disabled={sendingRequest}
                data-testid='send-friend-request-button'
              >
                {sendingRequest ? '요청 중...' : '친구 요청 보내기'}
              </Button>
            </form>

            <div className='mt-6 space-y-2 rounded-lg bg-blue-500/10 p-4'>
              <h3 className='font-semibold text-blue-600'>
                💡 테스트용 이메일
              </h3>
              <p className='text-sm text-muted-foreground'>
                song@example.com, yoon@example.com, lim@example.com
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
