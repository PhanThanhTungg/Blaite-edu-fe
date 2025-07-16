/*
  Warnings:

  - You are about to drop the column `topic_id` on the `questions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_topic_id_fkey";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "topic_id",
ADD COLUMN     "topicId" INTEGER;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
