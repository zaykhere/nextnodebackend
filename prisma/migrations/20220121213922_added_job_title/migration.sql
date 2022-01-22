-- AlterTable
ALTER TABLE `user` ADD COLUMN `IsVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `emailVerify` VARCHAR(10) NULL;
