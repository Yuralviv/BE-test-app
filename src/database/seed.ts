import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { DeviceModel } from './entities/device-model.entity';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import {
  MOCK_ADMIN,
  MOCK_CUSTOMERS,
  MOCK_MANAGER,
} from '../customers/data/mock-customers';
import { hashPassword } from '../customers/utils/hash-password';

const DEVICE_MODELS = [
  { id: 2, name: 'Motocaddy M5/S5 GPS Electric Trolley', iccidRequired: true },
  { id: 3, name: 'Motocaddy M5/S5 GPS DHC Electric Trolley', iccidRequired: true },
  { id: 6, name: 'Motocaddy M-TECH Electric Trolley', iccidRequired: true },
  { id: 7, name: 'Motocaddy M7 GPS Electric Trolley', iccidRequired: true },
];

async function main() {
  await AppDataSource.initialize();

  const deviceModelRepo = AppDataSource.getRepository(DeviceModel);
  const userRepo = AppDataSource.getRepository(User);

  for (const model of DEVICE_MODELS) {
    await deviceModelRepo.save({
      id: model.id,
      name: model.name,
      iccidRequired: model.iccidRequired,
    });
  }

  const users = [...MOCK_CUSTOMERS, MOCK_MANAGER, MOCK_ADMIN];

  for (const user of users) {
    await userRepo.save({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: hashPassword(user.password),
      role: (user.role as UserRole) ?? UserRole.CUSTOMER,
    });
  }

  await AppDataSource.destroy();
}

main().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
