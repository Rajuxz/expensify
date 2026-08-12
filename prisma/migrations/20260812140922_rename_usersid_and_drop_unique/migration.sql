-- Rename column
ALTER TABLE "Categories" RENAME COLUMN "usersId" TO "userId";

-- Rename the FK constraint
ALTER TABLE "Categories" RENAME CONSTRAINT "Categories_usersId_fkey" TO "Categories_userId_fkey";

-- Drop the unique indexes (not constraints) on name/icon
DROP INDEX "Categories_name_key";
DROP INDEX "Categories_icon_key";