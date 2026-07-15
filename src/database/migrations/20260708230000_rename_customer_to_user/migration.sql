-- Drop legacy unused User table
DROP TABLE IF EXISTS "User";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'MANAGER', 'ADMIN');

-- Rename Customer to User
ALTER TABLE "Customer" RENAME TO "User";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';

-- Rename device relation
ALTER TABLE "Device" RENAME COLUMN "customerId" TO "userId";

-- RenameIndex
ALTER INDEX "Device_customerId_idx" RENAME TO "Device_userId_idx";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_customerId_fkey";

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
