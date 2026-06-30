import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomerWithDevices } from '../customers/data/mock-customers';
import { hashPassword } from '../customers/utils/hash-password';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async register(data: RegisterDto): Promise<CustomerWithDevices> {
    const password = hashPassword(data.password);

    try {
      const customer = await this.db.customer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password,
          devices: {
            create: {
              iccid: data.device.iccid,
              imei: data.device.imei,
              deviceModel: data.device.deviceModel,
              motorType: data.device.motorType,
              batteryType: data.device.batteryType,
              os: data.device.os,
              firmwareVersion: data.device.firmwareVersion,
              geo: {},
              batteryState: {},
            },
          },
        },
        include: {
          devices: true,
        },
      });

      return this.toCustomerWithDevices(customer);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target;
        const fields = Array.isArray(target) ? target : [target];

        if (fields.includes('email')) {
          throw new ConflictException(
            `Customer with email ${data.email} already exists`,
          );
        }

        if (fields.includes('imei')) {
          throw new ConflictException(
            `Device with imei ${data.device.imei} is already registered`,
          );
        }

        throw new ConflictException('Email or device is already registered');
      }

      throw error;
    }
  }

  private toCustomerWithDevices(
    customer: Prisma.CustomerGetPayload<{ include: { devices: true } }>,
  ): CustomerWithDevices {
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      devices: customer.devices.map(
        ({
          id,
          iccid,
          imei,
          deviceModel,
          motorType,
          batteryType,
          os,
          firmwareVersion,
          geo,
          batteryState,
          createdAt,
          updatedAt,
        }) => ({
          id,
          iccid,
          imei,
          deviceModel,
          motorType,
          batteryType,
          os,
          firmwareVersion,
          geo: geo as CustomerWithDevices['devices'][number]['geo'],
          batteryState:
            batteryState as CustomerWithDevices['devices'][number]['batteryState'],
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        }),
      ),
    };
  }
}
