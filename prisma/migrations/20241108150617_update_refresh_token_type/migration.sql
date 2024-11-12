-- DropIndex
DROP INDEX `Token_RefreshToken_key` ON `token`;

-- AlterTable
ALTER TABLE `token` MODIFY `RefreshToken` LONGTEXT NOT NULL;
