-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN "email" TEXT,
ADD COLUMN "role" "Roles" NOT NULL DEFAULT 'USER';
