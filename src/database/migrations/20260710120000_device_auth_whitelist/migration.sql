-- CreateTable
CREATE TABLE "DeviceModel" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "iccidRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DeviceModel_pkey" PRIMARY KEY ("id")
);

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "secretKey" TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "verificationCodeSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "termsAgreed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "marketingTermsAgreed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "address" TEXT;
ALTER TABLE "User" ADD COLUMN "address2" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "postalCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AlterTable Device
ALTER TABLE "Device" ADD COLUMN "idDevice" TEXT;
ALTER TABLE "Device" ADD COLUMN "deviceModelId" INTEGER;

ALTER TABLE "Device" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Device" ALTER COLUMN "iccid" DROP NOT NULL;
ALTER TABLE "Device" ALTER COLUMN "imei" DROP NOT NULL;
ALTER TABLE "Device" ALTER COLUMN "motorType" SET DEFAULT '28V';
ALTER TABLE "Device" ALTER COLUMN "batteryType" SET DEFAULT 'Lithium';
ALTER TABLE "Device" ALTER COLUMN "os" SET DEFAULT 'ANDROID';
ALTER TABLE "Device" ALTER COLUMN "firmwareVersion" SET DEFAULT '0.0.0';
ALTER TABLE "Device" ALTER COLUMN "geo" SET DEFAULT '{"lat":0,"lng":0}';
ALTER TABLE "Device" ALTER COLUMN "batteryState" SET DEFAULT '{"level":0,"charging":false}';

ALTER TABLE "Device" DROP COLUMN "deviceModel";

-- Backfill idDevice for any existing rows before NOT NULL
UPDATE "Device" SET "idDevice" = COALESCE("imei", 'legacy-' || "id"::text) WHERE "idDevice" IS NULL;
UPDATE "Device" SET "deviceModelId" = 7 WHERE "deviceModelId" IS NULL;

ALTER TABLE "Device" ALTER COLUMN "idDevice" SET NOT NULL;
ALTER TABLE "Device" ALTER COLUMN "deviceModelId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Device_idDevice_deviceModelId_key" ON "Device"("idDevice", "deviceModelId");
CREATE INDEX "Device_deviceModelId_idx" ON "Device"("deviceModelId");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_deviceModelId_fkey" FOREIGN KEY ("deviceModelId") REFERENCES "DeviceModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey and re-add userId FK with SET NULL
ALTER TABLE "Device" DROP CONSTRAINT "Device_userId_fkey";
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
