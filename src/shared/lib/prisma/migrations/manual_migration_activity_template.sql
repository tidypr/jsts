-- ActivityTemplate 마이그레이션
-- 실행 전 반드시 데이터 백업!

BEGIN;

-- 1단계: ActivityTemplate 테이블 생성
CREATE TABLE "ActivityTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "color" TEXT NOT NULL,
    "emoji" TEXT,
    "defaultTime" INTEGER NOT NULL,
    "useInTimer" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ActivityTemplate_pkey" PRIMARY KEY ("id")
);

-- 2단계: Phase 테이블에 새 컬럼 추가
ALTER TABLE "Phase" 
ADD COLUMN "activityTemplateId" TEXT,
ADD COLUMN "emoji" TEXT,
ADD COLUMN "title" TEXT,
RENAME COLUMN "category" TO "color";

-- 3단계: TimerPreset 데이터를 ActivityTemplate으로 복사
INSERT INTO "ActivityTemplate" (
    "id",
    "title", 
    "note",
    "color",
    "emoji",
    "defaultTime",
    "useInTimer",
    "createdAt",
    "updatedAt",
    "userId"
)
SELECT 
    tp."id",
    tp."title",
    NULL as "note",
    tp."color",
    CASE 
        WHEN c."icon" IS NOT NULL THEN c."icon"
        ELSE '📝'
    END as "emoji",
    tp."defaultTime",
    true as "useInTimer",
    tp."createdAt",
    tp."updatedAt",
    tp."userId"
FROM "TimerPreset" tp
LEFT JOIN "Category" c ON c."id" = tp."categoryId";

-- 4단계: Phase의 categoryId를 activityTemplateId로 매핑 (필요한 경우)
-- Phase는 템플릿 없이도 생성 가능하므로 activityTemplateId는 optional
-- 기존 categoryId는 삭제

-- 5단계: 인덱스 생성
CREATE INDEX "ActivityTemplate_userId_idx" ON "ActivityTemplate"("userId");
CREATE INDEX "ActivityTemplate_userId_useInTimer_idx" ON "ActivityTemplate"("userId", "useInTimer");
CREATE INDEX "Phase_activityTemplateId_idx" ON "Phase"("activityTemplateId");

-- 6단계: Foreign Key 추가
ALTER TABLE "ActivityTemplate" ADD CONSTRAINT "ActivityTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_activityTemplateId_fkey" FOREIGN KEY ("activityTemplateId") REFERENCES "ActivityTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7단계: Phase 기존 인덱스 제거
DROP INDEX IF EXISTS "Phase_categoryId_idx";

-- 8단계: Phase의 categoryId 컬럼 제거
ALTER TABLE "Phase" DROP COLUMN IF EXISTS "categoryId";

-- 9단계: Post의 categoryId 컬럼 제거
ALTER TABLE "Post" DROP COLUMN IF EXISTS "categoryId";
DROP INDEX IF EXISTS "Post_categoryId_idx";

-- 10단계: 기존 테이블 삭제
DROP TABLE IF EXISTS "TimerPreset";
DROP TABLE IF EXISTS "Category";

COMMIT;

-- 롤백이 필요한 경우:
-- ROLLBACK;
