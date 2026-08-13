/*
  Warnings:

  - You are about to drop the column `icon` on the `Categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Categories" DROP COLUMN "icon";

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "Categories"("name");
