import 'dotenv/config';
import {
  PrismaClient,
  PointType,
  PhaseStatus,
  GoalType,
} from './generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

// Prisma Client 초기화
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// 비밀번호 해시
const PASSWORD = '1q2w#E$R';
const hashedPassword = bcrypt.hashSync(PASSWORD, 10);

// ActivityTemplate 데이터
const ACTIVITY_TEMPLATES = [
  { title: '집중 업무', color: '#22c55e', emoji: '💼', defaultTime: 25 * 60 },
  { title: '딥워크', color: '#16a34a', emoji: '🎯', defaultTime: 50 * 60 },
  { title: '공부', color: '#3b82f6', emoji: '📚', defaultTime: 30 * 60 },
  { title: '독서', color: '#8b5cf6', emoji: '📖', defaultTime: 20 * 60 },
  { title: '운동', color: '#f59e0b', emoji: '🏋️', defaultTime: 40 * 60 },
  { title: '명상', color: '#a855f7', emoji: '🧘', defaultTime: 15 * 60 },
  { title: '프로젝트', color: '#ec4899', emoji: '🚀', defaultTime: 45 * 60 },
  { title: '취미활동', color: '#14b8a6', emoji: '🎨', defaultTime: 30 * 60 },
  { title: '회의', color: '#f97316', emoji: '👥', defaultTime: 30 * 60 },
  { title: '휴식', color: '#6366f1', emoji: '😴', defaultTime: 10 * 60 },
];

// 태그 데이터
const TAGS = [
  '#집중완료',
  '#StudyChallenge',
  '#목표달성',
  '#꾸준함',
  '#성장',
  '#자기계발',
  '#운동',
  '#독서',
  '#코딩',
  '#프로젝트',
  '#취미',
  '#명상',
  '#생산성',
  '#건강',
  '#학습',
];

// 유틸리티 함수들
function randomDate(daysAgo: number = 30) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(
    Math.floor(Math.random() * 24),
    Math.floor(Math.random() * 60),
    0,
    0,
  );
  return date;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Seeding database with ActivityTemplate...');

  // 1. 기존 데이터 삭제
  console.log('🗑️  Clearing existing data...');
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.phase.deleteMany();
  await prisma.activityTemplate.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.point.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tag 생성
  console.log('🏷️  Creating tags...');
  const tags = await Promise.all(
    TAGS.map((tag) =>
      prisma.tag.create({
        data: { name: tag },
      }),
    ),
  );
  console.log(`✅ Created ${tags.length} tags`);

  // 3. BOT 유저 5명 생성
  console.log('👤 Creating 5 bot users...');
  const botUsers = [];

  for (let i = 1; i <= 5; i++) {
    const username = `BOT_${String(i).padStart(2, '0')}`;
    const user = await prisma.user.create({
      data: {
        email: `${username.toLowerCase()}@example.com`,
        name: username,
        password: hashedPassword,
        image: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}`,
        bio: `안녕하세요! ${username}입니다. 꾸준한 성장을 목표로 하고 있습니다.`,
      },
    });
    botUsers.push(user);

    // Subscription 생성
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE',
      },
    });

    // Goal 생성 (3가지)
    await prisma.goal.createMany({
      data: [
        {
          userId: user.id,
          type: GoalType.DAILY,
          targetMinutes: randomInt(120, 240), // 2-4시간
        },
        {
          userId: user.id,
          type: GoalType.WEEKLY,
          targetMinutes: randomInt(600, 1200), // 10-20시간
        },
        {
          userId: user.id,
          type: GoalType.MONTHLY,
          targetMinutes: randomInt(2400, 4800), // 40-80시간
        },
      ],
    });

    // ActivityTemplate 생성 (각 유저당 5-8개)
    const templateCount = randomInt(5, 8);
    const userTemplates = [];
    const shuffledTemplates = [...ACTIVITY_TEMPLATES].sort(
      () => Math.random() - 0.5,
    );

    for (let j = 0; j < templateCount; j++) {
      const template = shuffledTemplates[j];
      const useInTimer = Math.random() > 0.3; // 70% 확률로 타이머에 표시

      const createdTemplate = await prisma.activityTemplate.create({
        data: {
          userId: user.id,
          title: template.title,
          note: `${template.title}에 집중하는 시간`,
          color: template.color,
          emoji: template.emoji,
          defaultTime: template.defaultTime,
          useInTimer,
        },
      });
      userTemplates.push(createdTemplate);
    }

    console.log(`  ✅ ${username}: ${userTemplates.length} templates created`);
  }
  console.log(`✅ Created ${botUsers.length} bot users`);

  // 4. Phase 생성 (각 유저당 20-40개, 2배 증가)
  console.log('⏱️  Creating phases...');
  let totalPhases = 0;

  for (const user of botUsers) {
    // 유저의 템플릿 가져오기
    const userTemplates = await prisma.activityTemplate.findMany({
      where: { userId: user.id },
    });

    const phaseCount = randomInt(20, 40);

    for (let i = 0; i < phaseCount; i++) {
      const template = randomChoice(userTemplates);
      const startDate = randomDate(30);
      const duration = randomInt(10, 180); // 10분 ~ 3시간
      const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

      await prisma.phase.create({
        data: {
          userId: user.id,
          activityTemplateId: template.id,
          color: template.color,
          emoji: template.emoji,
          title: template.title,
          note: `${template.title} - ${i + 1}회차`,
          startTime: startDate,
          endTime: endDate,
          status: PhaseStatus.COMPLETED,
          segments: {
            create: {
              startTime: startDate,
              endTime: endDate,
            },
          },
        },
      });

      // Phase 완료 포인트
      await prisma.point.create({
        data: {
          userId: user.id,
          amount: Math.floor(duration / 10), // 10분당 1포인트
          type: PointType.PHASE_COMPLETE,
          description: `${template.title} 완료`,
        },
      });

      totalPhases++;
    }
  }
  console.log(`✅ Created ${totalPhases} phases`);

  // 5. Post 생성 (각 유저당 8-16개, 2배 증가)
  console.log('📝 Creating posts...');
  let totalPosts = 0;
  const allPosts = [];

  for (const user of botUsers) {
    const postCount = randomInt(8, 16);

    for (let i = 0; i < postCount; i++) {
      const createdAt = randomDate(25);

      const post = await prisma.post.create({
        data: {
          userId: user.id,
          title: `오늘의 활동 후기 ${i + 1}`,
          content: `오늘도 열심히 집중했습니다! 목표를 향해 한 걸음씩 나아가고 있어요. 
계속 꾸준히 해나가겠습니다. 여러분도 화이팅!`,
          views: randomInt(20, 800),
          createdAt,
        },
      });

      // PostTag 연결 (2-5개)
      const tagCount = randomInt(2, 5);
      const shuffledTags = [...tags].sort(() => Math.random() - 0.5);
      const postTags = shuffledTags.slice(0, tagCount);

      await prisma.postTag.createMany({
        data: postTags.map((tag) => ({
          postId: post.id,
          tagId: tag.id,
        })),
      });

      allPosts.push(post);
      totalPosts++;
    }
  }
  console.log(`✅ Created ${totalPosts} posts`);

  // 6. Like 생성 (포스트당 0-20개, 2배 증가)
  console.log('❤️  Creating likes...');
  let totalLikes = 0;

  for (const post of allPosts) {
    const likeCount = randomInt(0, 20);
    const shuffledUsers = [...botUsers].sort(() => Math.random() - 0.5);
    const likers = shuffledUsers.slice(0, Math.min(likeCount, botUsers.length));

    for (const liker of likers) {
      if (liker.id !== post.userId) {
        try {
          await prisma.like.create({
            data: {
              postId: post.id,
              userId: liker.id,
            },
          });
          totalLikes++;
        } catch {
          // 중복 좋아요 무시
        }
      }
    }
  }
  console.log(`✅ Created ${totalLikes} likes`);

  // 7. Comment 생성 (포스트당 0-12개, 2배 증가)
  console.log('💬 Creating comments...');
  let totalComments = 0;

  const COMMENT_TEMPLATES = [
    '정말 대단하시네요! 저도 열심히 해야겠어요!',
    '멋진 활동이에요! 응원합니다!',
    '꾸준함이 느껴져요. 화이팅!',
    '저도 함께 도전해볼게요!',
    '좋은 자극이 되네요. 감사합니다!',
    '대단한 성과네요! 축하합니다!',
    '함께 성장해요!',
    '오늘도 수고하셨어요!',
  ];

  for (const post of allPosts) {
    const commentCount = randomInt(0, 12);
    const shuffledUsers = [...botUsers].sort(() => Math.random() - 0.5);
    const commenters = shuffledUsers.slice(0, commentCount);

    for (const commenter of commenters) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          userId: commenter.id,
          content: randomChoice(COMMENT_TEMPLATES),
          createdAt: new Date(
            post.createdAt.getTime() + randomInt(5, 240) * 60 * 1000,
          ),
        },
      });
      totalComments++;
    }
  }
  console.log(`✅ Created ${totalComments} comments`);

  // 8. 추가 포인트 생성 (목표 달성)
  console.log('💰 Creating achievement points...');
  for (const user of botUsers) {
    // 일일 목표 달성 (2-3회)
    const dailyCount = randomInt(2, 3);
    for (let i = 0; i < dailyCount; i++) {
      await prisma.point.create({
        data: {
          userId: user.id,
          amount: 50,
          type: PointType.DAILY_GOAL,
          description: '일일 목표 달성',
          createdAt: randomDate(20),
        },
      });
    }

    // 주간 목표 달성 (1-2회)
    if (Math.random() > 0.3) {
      await prisma.point.create({
        data: {
          userId: user.id,
          amount: 200,
          type: PointType.WEEKLY_GOAL,
          description: '주간 목표 달성',
          createdAt: randomDate(15),
        },
      });
    }

    // 월간 목표 달성 (랜덤)
    if (Math.random() > 0.7) {
      await prisma.point.create({
        data: {
          userId: user.id,
          amount: 500,
          type: PointType.MONTHLY_GOAL,
          description: '월간 목표 달성',
          createdAt: randomDate(10),
        },
      });
    }
  }
  console.log('✅ Created achievement points');

  // 최종 요약
  const finalCounts = {
    users: await prisma.user.count(),
    templates: await prisma.activityTemplate.count(),
    phases: await prisma.phase.count(),
    posts: await prisma.post.count(),
    likes: await prisma.like.count(),
    comments: await prisma.comment.count(),
    tags: await prisma.tag.count(),
    points: await prisma.point.count(),
  };

  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: ${finalCounts.users}`);
  console.log(`   - Activity Templates: ${finalCounts.templates}`);
  console.log(`   - Phases: ${finalCounts.phases}`);
  console.log(`   - Posts: ${finalCounts.posts}`);
  console.log(`   - Likes: ${finalCounts.likes}`);
  console.log(`   - Comments: ${finalCounts.comments}`);
  console.log(`   - Tags: ${finalCounts.tags}`);
  console.log(`   - Points: ${finalCounts.points}`);
  console.log('');
  console.log('👤 Bot Users:');
  console.log('   - Email: bot_01@example.com ~ bot_05@example.com');
  console.log('   - Password: 1q2w#E$R');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
