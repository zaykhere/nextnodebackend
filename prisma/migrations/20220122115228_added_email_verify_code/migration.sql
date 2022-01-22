-- AlterTable
ALTER TABLE `user` ADD COLUMN `email_verify_code_sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
