/*
  Warnings:

  - Added the required column `size` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cartitem` ADD COLUMN `size` VARCHAR(191) NOT NULL;
