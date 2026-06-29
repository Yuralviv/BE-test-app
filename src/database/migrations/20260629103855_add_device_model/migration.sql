-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "iccid" TEXT NOT NULL,
    "imei" TEXT NOT NULL,
    "deviceModel" TEXT NOT NULL,
    "motorType" TEXT NOT NULL,
    "batteryType" TEXT NOT NULL,
    "geo" JSONB NOT NULL,
    "batteryState" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_imei_key" ON "Device"("imei");
