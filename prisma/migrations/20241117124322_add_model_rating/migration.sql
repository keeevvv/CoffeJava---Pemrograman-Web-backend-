-- AlterTable
ALTER TABLE `product` ADD COLUMN `discount` DOUBLE NULL,
    ADD COLUMN `sale` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `Rating` (
    `rating_id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` DOUBLE NOT NULL,
    `review` VARCHAR(191) NULL,
    `product_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`rating_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
