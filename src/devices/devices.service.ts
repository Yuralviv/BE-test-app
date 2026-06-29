import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceTelemetryDto } from './dto/update-device-telemetry.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateDeviceDto) {
    const existing = await this.db.device.findUnique({
      where: { imei: data.imei },
    });

    if (existing) {
      throw new ConflictException(`Device with imei ${data.imei} already exists`);
    }

    return this.db.device.create({
      data: {
        ...data,
        geo: {},
        batteryState: {},
      },
    });
  }

  async updateTelemetry(imei: string, data: UpdateDeviceTelemetryDto) {
    try {
      return await this.db.device.update({
        where: { imei },
        data: {
          geo: data.geo as Prisma.InputJsonValue,
          batteryState: data.batteryState as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Device with imei ${imei} not found`);
      }
      throw error;
    }
  }

  findAll() {
    return this.db.device.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }
}
