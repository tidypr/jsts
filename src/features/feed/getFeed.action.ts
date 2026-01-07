'use server';

import { Post, FeedFilter, feedFilterSchema } from './feedSchema';
import { z } from 'zod';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

// Mock data
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    author: {
      name: 'Sarah Chen',
      handle: '@sarah_studies',
      avatar: undefined,
    },
    category: '2h ago • Coding Challenge',
    title: 'Just finished my 3-hour Python sprint! 🔥',
    content:
      'It was tough but I managed to solve the algorithm problems I was stuck on yesterday. Feeling accomplished! The key was breaking down...',
    tags: ['#StudyChallenge', '#Python70'],
    stats: { likes: 124, comments: 18, views: 1200 },
    image: undefined,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
  },
  {
    id: 2,
    author: {
      name: 'Marcus Johnson',
      handle: '@marcusj',
      avatar: undefined,
    },
    category: '5h ago • Morning Routine',
    title: 'Any tips for the 5 AM club? 📚',
    content:
      "I've been trying to wake up at 5 AM for a week now but I keep hitting snooze. What's your secret to actually getting up?",
    tags: ['#MorningHabit', '#Productivity'],
    stats: { likes: 89, comments: 32, views: 800 },
    image: undefined,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5시간 전
  },
  {
    id: 3,
    author: {
      name: 'Sarah_Studies',
      handle: '@sarah_studies',
      avatar: undefined,
    },
    category: '2 hours ago',
    title: 'Finally hit my 6 AM goal! 🌅',
    content:
      "It took me two weeks of struggle, but I finally woke up without hitting snooze. Here's my victory sunrise moment...",
    tags: ['#earlybird', '#productivity'],
    stats: { likes: 123, comments: 14, views: 1200 },
    image: undefined,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 4,
    author: {
      name: 'FocusMaster99',
      handle: '@focusmaster',
      avatar: undefined,
    },
    category: '4 hours ago',
    title: 'Need advice on Pomodoro timers ⏱️',
    content:
      "Does anyone else find like the 5 minute break isn't enough? I'm thinking of switching to 50/10. What works best for deep work sessions?",
    tags: ['#studytips', '#Productivity'],
    stats: { likes: 24, comments: 8, views: 450 },
    image: undefined,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 5,
    author: {
      name: 'Jenny_Goals',
      handle: '@jenny_goals',
      avatar: undefined,
    },
    category: '8 hours ago',
    title: '🎉 30 Day Streak Achieved!',
    content:
      "I can't believe I actually stuck with it! The social support here has been amazing. Thank you all!",
    tags: ['#milestone', '#consistency'],
    stats: { likes: 643, comments: 89, views: 3400 },
    image: undefined,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: 6,
    author: {
      name: 'David Kim',
      handle: '@davidk',
      avatar: undefined,
    },
    category: '10h ago • Free Talk',
    title: 'Finally cleared my desk! Workspace tour 📚',
    content:
      'A clean space really does help with a clean mind. Here is my setup for the weekend study session. What does your workspace look like?',
    tags: ['#workspace', '#studysetup'],
    stats: { likes: 324, comments: 43, views: 2100 },
    image: undefined,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
  },
];

/**
 * 피드 데이터를 가져오는 Server Action
 * @param filter - 정렬 및 필터링 옵션
 */
export async function getFeedAction(
  filter: FeedFilter = { sortBy: 'newest', limit: 20, offset: 0 },
): Promise<ActionResult<{ posts: Post[]; total: number }>> {
  try {
    // Validation
    const validFilter = feedFilterSchema.parse(filter);

    // API 호출 시뮬레이션 (300ms 딜레이)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock data 복사 (불변성 유지)
    let posts = [...MOCK_POSTS];

    // 카테고리 필터링
    if (validFilter.category) {
      posts = posts.filter((post) =>
        post.category.toLowerCase().includes(validFilter.category!.toLowerCase()),
      );
    }

    // 정렬
    switch (validFilter.sortBy) {
      case 'newest':
        posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'popular':
        posts.sort((a, b) => b.stats.likes - a.stats.likes);
        break;
      case 'discussed':
        posts.sort((a, b) => b.stats.comments - a.stats.comments);
        break;
    }

    // 페이지네이션
    const total = posts.length;
    const paginatedPosts = posts.slice(
      validFilter.offset,
      validFilter.offset + validFilter.limit,
    );

    return {
      success: true,
      data: {
        posts: paginatedPosts,
        total,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: '필터 데이터가 올바르지 않습니다.',
        details: error.issues,
      };
    }

    console.error('피드 조회 실패:', error);
    return {
      success: false,
      error: '피드를 불러오는 중 오류가 발생했습니다.',
    };
  }
}
