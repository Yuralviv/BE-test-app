-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "password" DROP DEFAULT;
