/*
  Warnings:

  - You are about to drop the column `category` on the `Phase` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Phase` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimerPreset` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Phase" DROP CONSTRAINT "Phase_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "TimerPreset" DROP CONSTRAINT "TimerPreset_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "TimerPreset" DROP CONSTRAINT "TimerPreset_userId_fkey";

-- DropIndex
DROP INDEX "Phase_categoryId_idx";

-- DropIndex
DROP INDEX "Post_categoryId_idx";

-- AlterTable
ALTER TABLE "Phase" DROP COLUMN "category",
DROP COLUMN "categoryId",
ADD COLUMN     "activityTemplateId" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "TimerPreset";

-- CreateTable
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

-- CreateIndex
CREATE INDEX "ActivityTemplate_userId_idx" ON "ActivityTemplate"("userId");

-- CreateIndex
CREATE INDEX "ActivityTemplate_userId_useInTimer_idx" ON "ActivityTemplate"("userId", "useInTimer");

-- CreateIndex
CREATE INDEX "Phase_activityTemplateId_idx" ON "Phase"("activityTemplateId");

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_activityTemplateId_fkey" FOREIGN KEY ("activityTemplateId") REFERENCES "ActivityTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTemplate" ADD CONSTRAINT "ActivityTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
