-- CreateTable
CREATE TABLE `Product` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pName` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,

    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubCategory` (
    `sub_category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `sub_category_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`sub_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SpecificSubCategory` (
    `specific_sub_category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `specific_sub_category_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`specific_sub_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategory` (
    `product_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,

    PRIMARY KEY (`product_id`, `category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSubCategory` (
    `product_id` INTEGER NOT NULL,
    `sub_category_id` INTEGER NOT NULL,

    PRIMARY KEY (`product_id`, `sub_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSpecificSubCategory` (
    `product_id` INTEGER NOT NULL,
    `specific_sub_category_id` INTEGER NOT NULL,

    PRIMARY KEY (`product_id`, `specific_sub_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `stock_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,

    UNIQUE INDEX `Stock_product_id_size_key`(`product_id`, `size`),
    PRIMARY KEY (`stock_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Image` (
    `image_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`image_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubCategory` ADD CONSTRAINT `ProductSubCategory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubCategory` ADD CONSTRAINT `ProductSubCategory_sub_category_id_fkey` FOREIGN KEY (`sub_category_id`) REFERENCES `SubCategory`(`sub_category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSpecificSubCategory` ADD CONSTRAINT `ProductSpecificSubCategory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSpecificSubCategory` ADD CONSTRAINT `ProductSpecificSubCategory_specific_sub_category_id_fkey` FOREIGN KEY (`specific_sub_category_id`) REFERENCES `SpecificSubCategory`(`specific_sub_category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;
