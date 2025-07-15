/*
  Warnings:

  - You are about to drop the `streaks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "streaks" DROP CONSTRAINT "streaks_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastActiveDate" TIMESTAMP(3),
ADD COLUMN     "streak" INTEGER DEFAULT 0;

-- DropTable
DROP TABLE "streaks";
