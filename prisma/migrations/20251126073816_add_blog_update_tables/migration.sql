/*
  Warnings:

  - You are about to drop the column `tag_id` on the `Blog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_tag_id_fkey";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "tag_id";
