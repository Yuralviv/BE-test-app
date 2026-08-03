import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { hashPassword } from '../customers/utils/hash-password';
import {
  MOCK_ADMIN,
  MOCK_MANAGER,
} from '../customers/data/mock-customers';

async function tableExists(table: string): Promise<boolean> {
  const result = await AppDataSource.query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [table],
  );

  return Boolean(result[0]?.exists);
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const result = await AppDataSource.query(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    ) AS exists`,
    [table, column],
  );

  return Boolean(result[0]?.exists);
}

async function ensureUserRoleEnum() {
  await AppDataSource.query(`
    DO $$ BEGIN
      CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'MANAGER', 'ADMIN');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `);
}

async function repairCustomerToUserRename() {
  const customerExists = await tableExists('Customer');
  const userHasFirstName = await columnExists('User', 'firstName');

  if (!customerExists || userHasFirstName) {
    return;
  }

  console.log('Repair: renaming Customer to User (legacy User table detected).');

  await AppDataSource.query(
    `ALTER TABLE "Device" DROP CONSTRAINT IF EXISTS "Device_customerId_fkey"`,
  );
  await AppDataSource.query(
    `ALTER TABLE "Device" DROP CONSTRAINT IF EXISTS "Device_userId_fkey"`,
  );
  await AppDataSource.query(`DROP TABLE IF EXISTS "User" CASCADE`);
  await AppDataSource.query(`ALTER TABLE "Customer" RENAME TO "User"`);

  if (await columnExists('Device', 'customerId')) {
    await AppDataSource.query(
      `ALTER TABLE "Device" RENAME COLUMN "customerId" TO "userId"`,
    );
  }

  await ensureUserRoleEnum();

  if (!(await columnExists('User', 'role'))) {
    await AppDataSource.query(
      `ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER'`,
    );
  }

  await AppDataSource.query(`
    DO $$ BEGIN
      ALTER INDEX "Device_customerId_idx" RENAME TO "Device_userId_idx";
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END $$
  `);

  await AppDataSource.query(`
    ALTER TABLE "Device"
    ADD CONSTRAINT "Device_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
  `).catch(() => undefined);
}

async function repairUserColumns() {
  if (!(await tableExists('User'))) {
    return;
  }

  await ensureUserRoleEnum();

  if (!(await columnExists('User', 'role'))) {
    await AppDataSource.query(
      `ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER'`,
    );
  }

  const optionalColumns = [
    ['phoneNumber', 'TEXT', null],
    ['username', 'TEXT', null],
    ['secretKey', 'TEXT', null],
    ['emailVerified', 'BOOLEAN NOT NULL DEFAULT false', null],
    ['verificationCodeSentAt', 'TIMESTAMP(3)', null],
    ['termsAgreed', 'BOOLEAN NOT NULL DEFAULT false', null],
    ['marketingTermsAgreed', 'BOOLEAN NOT NULL DEFAULT false', null],
    ['address', 'TEXT', null],
    ['address2', 'TEXT', null],
    ['city', 'TEXT', null],
    ['postalCode', 'TEXT', null],
  ] as const;

  for (const [column, type] of optionalColumns) {
    if (!(await columnExists('User', column))) {
      await AppDataSource.query(
        `ALTER TABLE "User" ADD COLUMN "${column}" ${type}`,
      );
    }
  }
}

async function repairDeviceModels() {
  await AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS "DeviceModel" (
      "id" INTEGER NOT NULL,
      "name" TEXT NOT NULL,
      "iccidRequired" BOOLEAN NOT NULL DEFAULT false,
      CONSTRAINT "DeviceModel_pkey" PRIMARY KEY ("id")
    )
  `);

  const models = [
    [2, 'Motocaddy M5/S5 GPS Electric Trolley', true],
    [3, 'Motocaddy M5/S5 GPS DHC Electric Trolley', true],
    [6, 'Motocaddy M-TECH Electric Trolley', true],
    [7, 'Motocaddy M7 GPS Electric Trolley', true],
  ] as const;

  for (const [id, name, iccidRequired] of models) {
    await AppDataSource.query(
      `INSERT INTO "DeviceModel" ("id", "name", "iccidRequired")
       VALUES ($1, $2, $3)
       ON CONFLICT ("id") DO NOTHING`,
      [id, name, iccidRequired],
    );
  }
}

async function repairDeviceColumns() {
  if (!(await tableExists('Device'))) {
    return;
  }

  if (!(await columnExists('Device', 'userId')) && (await columnExists('Device', 'customerId'))) {
    await AppDataSource.query(
      `ALTER TABLE "Device" RENAME COLUMN "customerId" TO "userId"`,
    );
  }

  if (!(await columnExists('Device', 'idDevice'))) {
    await AppDataSource.query(`ALTER TABLE "Device" ADD COLUMN "idDevice" TEXT`);
    await AppDataSource.query(
      `UPDATE "Device" SET "idDevice" = COALESCE("imei", 'legacy-' || "id"::text) WHERE "idDevice" IS NULL`,
    );
    await AppDataSource.query(
      `ALTER TABLE "Device" ALTER COLUMN "idDevice" SET NOT NULL`,
    );
  }

  if (!(await columnExists('Device', 'deviceModelId'))) {
    await AppDataSource.query(
      `ALTER TABLE "Device" ADD COLUMN "deviceModelId" INTEGER`,
    );
    await AppDataSource.query(
      `UPDATE "Device" SET "deviceModelId" = 7 WHERE "deviceModelId" IS NULL`,
    );
    await AppDataSource.query(
      `ALTER TABLE "Device" ALTER COLUMN "deviceModelId" SET NOT NULL`,
    );
  }

  if (
    (await columnExists('Device', 'deviceModel')) &&
    (await columnExists('Device', 'deviceModelId'))
  ) {
    await AppDataSource.query(`ALTER TABLE "Device" DROP COLUMN "deviceModel"`);
    console.log('Repair: dropped legacy Device.deviceModel column');
  }

  if (await columnExists('Device', 'motorType')) {
    await AppDataSource.query(`ALTER TABLE "Device" DROP COLUMN "motorType"`);
    console.log('Repair: dropped legacy Device.motorType column');
  }

  await AppDataSource.query(
    `ALTER TABLE "Device" ALTER COLUMN "iccid" DROP NOT NULL`,
  ).catch(() => undefined);

  await AppDataSource.query(
    `ALTER TABLE "Device" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
  ).catch(() => undefined);

  await AppDataSource.query(
    `ALTER TABLE "Device" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
  ).catch(() => undefined);
}

async function ensureStaffUser(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'MANAGER' | 'ADMIN';
}) {
  const passwordHash = hashPassword(user.password);
  const existing = await AppDataSource.query(
    `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
    [user.email],
  );

  if (existing.length > 0) {
    await AppDataSource.query(
      `UPDATE "User"
       SET password = $1, role = $2, "firstName" = $3, "lastName" = $4, "updatedAt" = NOW()
       WHERE email = $5`,
      [passwordHash, user.role, user.firstName, user.lastName, user.email],
    );
    console.log(`Repair: updated ${user.role} user ${user.email}`);
    return;
  }

  await AppDataSource.query(
    `INSERT INTO "User" (id, "firstName", "lastName", email, password, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      passwordHash,
      user.role,
    ],
  );

  console.log(`Repair: seeded ${user.role} user ${user.email}`);
}

async function repairSchema() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set; skipping schema repair.');
    return;
  }

  await AppDataSource.initialize();

  try {
    await repairCustomerToUserRename();
    await repairUserColumns();
    await repairDeviceModels();
    await repairDeviceColumns();
    await ensureStaffUser({ ...MOCK_ADMIN, role: 'ADMIN' });
    await ensureStaffUser({ ...MOCK_MANAGER, role: 'MANAGER' });

    const userHasFirstName = await columnExists('User', 'firstName');
    if (!userHasFirstName) {
      throw new Error('Schema repair finished but User.firstName is still missing.');
    }

    console.log('Schema repair completed successfully.');
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

repairSchema().catch((error) => {
  console.error('Schema repair failed:', error);
  process.exit(1);
});
