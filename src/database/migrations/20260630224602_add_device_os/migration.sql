-- CreateEnum
CREATE TYPE "DeviceOs" AS ENUM ('ANDROID', 'LINUX');

-- AlterTable
ALTER TABLE "Device" ADD COLUMN "os" "DeviceOs" NOT NULL DEFAULT 'ANDROID';

-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "os" DROP DEFAULT;
