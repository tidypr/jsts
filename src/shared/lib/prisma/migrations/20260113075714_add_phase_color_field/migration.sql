-- DropForeignKey
ALTER TABLE "Phase" DROP CONSTRAINT "Phase_categoryId_fkey";

-- AlterTable
ALTER TABLE "Phase" ADD COLUMN     "category" TEXT,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
