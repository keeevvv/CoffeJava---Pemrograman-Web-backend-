-- AlterTable
ALTER TABLE `product` ADD COLUMN `brand` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    ADD COLUMN `desc` VARCHAR(191) NOT NULL DEFAULT 'No description available';
