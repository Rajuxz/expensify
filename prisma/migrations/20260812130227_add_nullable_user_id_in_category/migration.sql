-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "usersId" UUID;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
