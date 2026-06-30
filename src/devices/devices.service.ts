import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { UpdateDeviceTelemetryDto } from './dto/update-device-telemetry.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly db: DatabaseService) {}

  async updateTelemetry(imei: string, data: UpdateDeviceTelemetryDto) {
    try {
      return await this.db.device.update({
        where: { imei },
        data: {
          geo: data.geo as unknown as Prisma.InputJsonValue,
          batteryState: data.batteryState as unknown as Prisma.InputJsonValue,
          batteryType: data.batteryType,
          firmwareVersion: data.firmwareVersion,
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
}
