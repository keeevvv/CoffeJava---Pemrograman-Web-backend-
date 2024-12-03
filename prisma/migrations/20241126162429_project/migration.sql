/*
  Warnings:

  - You are about to drop the column `sessionId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `shippingaddress` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Order_sessionId_key` ON `order`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `sessionId`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `shippingaddress` DROP COLUMN `status`;
