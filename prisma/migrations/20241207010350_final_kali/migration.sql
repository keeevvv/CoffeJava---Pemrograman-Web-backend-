-- AlterTable
ALTER TABLE `product` ADD COLUMN `discount` DOUBLE NULL,
    ADD COLUMN `sale` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `profileImage` VARCHAR(191) NULL;
