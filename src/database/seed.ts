import { PrismaClient } from '@prisma/client';
import { MOCK_CUSTOMERS } from '../customers/data/mock-customers';
import { hashPassword } from '../customers/utils/hash-password';

const prisma = new PrismaClient();

async function main() {
  for (const customer of MOCK_CUSTOMERS) {
    const password = hashPassword(customer.password);

    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        password,
      },
      create: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        password,
      },
    });

    for (const device of customer.devices) {
      await prisma.device.upsert({
        where: { imei: device.imei },
        update: {
          customerId: customer.id,
          iccid: device.iccid,
          deviceModel: device.deviceModel,
          motorType: device.motorType,
          batteryType: device.batteryType,
          os: device.os,
          firmwareVersion: device.firmwareVersion,
          geo: device.geo,
          batteryState: device.batteryState,
          createdAt: new Date(device.createdAt),
          updatedAt: new Date(device.updatedAt),
        },
        create: {
          id: device.id,
          customerId: customer.id,
          iccid: device.iccid,
          imei: device.imei,
          deviceModel: device.deviceModel,
          motorType: device.motorType,
          batteryType: device.batteryType,
          os: device.os,
          firmwareVersion: device.firmwareVersion,
          geo: device.geo,
          batteryState: device.batteryState,
          createdAt: new Date(device.createdAt),
          updatedAt: new Date(device.updatedAt),
        },
      });
    }
  }

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Device"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Device"), 1)
    )
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
