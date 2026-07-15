import { User } from '../../database/entities/user.entity';
import { CustomerWithDevices } from '../data/mock-customers';
import { mapDevice } from './map-device';

export type UserWithDevices = User & {
  devices: Array<User['devices'][number] & { deviceModelRef: { name: string } }>;
};

export function mapUserToCustomerWithDevices(
  user: UserWithDevices,
): CustomerWithDevices {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    devices: user.devices.map(mapDevice),
  };
}
