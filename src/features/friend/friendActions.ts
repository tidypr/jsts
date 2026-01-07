'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  Friend,
  SendFriendRequestInput,
  sendFriendRequestSchema,
  RespondFriendRequestInput,
  respondFriendRequestSchema,
  DeleteFriendInput,
  deleteFriendSchema,
} from './friendSchema';
import {
  mockFriends,
  mockFriendRequests,
  mockSentRequests,
  mockUsers,
} from './mockData';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

/**
 * 친구 목록 조회
 */
export async function getFriendsAction(
  userId: string,
): Promise<ActionResult<Friend[]>> {
  try {
    // Mock delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Filter friends by userId and accepted status
    const friends = mockFriends.filter(
      (friend) => friend.userId === userId && friend.status === 'accepted',
    );

    return { success: true, data: friends };
  } catch (error) {
    console.error('친구 목록 조회 실패:', error);
    return {
      success: false,
      error: '친구 목록을 불러오는데 실패했습니다.',
    };
  }
}

/**
 * 받은 친구 요청 조회
 */
export async function getFriendRequestsAction(
  userId: string,
): Promise<ActionResult<Friend[]>> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Filter requests where user is the receiver (friendId)
    const requests = mockFriendRequests.filter(
      (request) => request.friendId === userId && request.status === 'pending',
    );

    return { success: true, data: requests };
  } catch (error) {
    console.error('친구 요청 조회 실패:', error);
    return {
      success: false,
      error: '친구 요청을 불러오는데 실패했습니다.',
    };
  }
}

/**
 * 보낸 친구 요청 조회
 */
export async function getSentRequestsAction(
  userId: string,
): Promise<ActionResult<Friend[]>> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const sentRequests = mockSentRequests.filter(
      (request) => request.userId === userId && request.status === 'pending',
    );

    return { success: true, data: sentRequests };
  } catch (error) {
    console.error('보낸 요청 조회 실패:', error);
    return {
      success: false,
      error: '보낸 요청을 불러오는데 실패했습니다.',
    };
  }
}

/**
 * 친구 요청 보내기
 */
export async function sendFriendRequestAction(
  rawData: SendFriendRequestInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validation
    const validData = sendFriendRequestSchema.parse(rawData);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user exists
    const targetUser = mockUsers.find(
      (user) => user.email === validData.friendEmail,
    );

    if (!targetUser) {
      return {
        success: false,
        error: '해당 이메일의 사용자를 찾을 수 없습니다.',
      };
    }

    // Check if already friends or request exists
    const existingFriend = [...mockFriends, ...mockSentRequests].find(
      (friend) =>
        friend.userId === validData.userId &&
        friend.friendId === targetUser.id,
    );

    if (existingFriend) {
      return {
        success: false,
        error: '이미 친구이거나 요청을 보낸 사용자입니다.',
      };
    }

    // Create new friend request
    const newRequest: Friend = {
      id: `sent-${Date.now()}`,
      userId: validData.userId,
      friendId: targetUser.id,
      friendName: targetUser.name,
      friendEmail: targetUser.email,
      friendAvatar: targetUser.avatar,
      status: 'pending',
      createdAt: new Date(),
    };

    // Add to mock sent requests (in real app, this would be saved to DB)
    mockSentRequests.push(newRequest);

    revalidatePath('/social');
    revalidatePath('/home');

    return { success: true, data: { id: newRequest.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('친구 요청 실패:', error);
    return {
      success: false,
      error: '친구 요청 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 친구 요청 수락/거절
 */
export async function respondFriendRequestAction(
  rawData: RespondFriendRequestInput,
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const validData = respondFriendRequestSchema.parse(rawData);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const requestIndex = mockFriendRequests.findIndex(
      (req) => req.id === validData.requestId,
    );

    if (requestIndex === -1) {
      return {
        success: false,
        error: '요청을 찾을 수 없습니다.',
      };
    }

    const request = mockFriendRequests[requestIndex];

    if (validData.accept) {
      // Accept request - move to friends list
      const newFriend: Friend = {
        ...request,
        status: 'accepted',
      };
      mockFriends.push(newFriend);
    } else {
      // Reject request - just update status
      request.status = 'rejected';
    }

    // Remove from requests
    mockFriendRequests.splice(requestIndex, 1);

    revalidatePath('/social');
    revalidatePath('/home');

    return { success: true, data: { success: true } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('친구 요청 응답 실패:', error);
    return {
      success: false,
      error: '요청 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 친구 삭제
 */
export async function deleteFriendAction(
  rawData: DeleteFriendInput,
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const validData = deleteFriendSchema.parse(rawData);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const friendIndex = mockFriends.findIndex(
      (friend) =>
        friend.id === validData.friendId && friend.userId === validData.userId,
    );

    if (friendIndex === -1) {
      return {
        success: false,
        error: '친구를 찾을 수 없습니다.',
      };
    }

    // Remove from friends list
    mockFriends.splice(friendIndex, 1);

    revalidatePath('/social');
    revalidatePath('/home');

    return { success: true, data: { success: true } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: '입력 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('친구 삭제 실패:', error);
    return {
      success: false,
      error: '친구 삭제 중 오류가 발생했습니다.',
    };
  }
}
