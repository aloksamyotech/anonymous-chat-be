/*
  Warnings:

  - Added the required column `status` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'DELIVERED');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "status" "Status" NOT NULL;
