-- AlterTable
ALTER TABLE "Device" ADD COLUMN "firmwareVersion" TEXT NOT NULL DEFAULT '0.0.0';

-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "firmwareVersion" DROP DEFAULT;
