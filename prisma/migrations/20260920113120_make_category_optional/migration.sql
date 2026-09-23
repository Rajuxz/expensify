-- DropForeignKey
ALTER TABLE "Expenses" DROP CONSTRAINT "Expenses_categoryId_fkey";

-- AlterTable
ALTER TABLE "Expenses" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
