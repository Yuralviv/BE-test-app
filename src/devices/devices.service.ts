import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../database/entities/device.entity';
import { DeviceModel } from '../database/entities/device-model.entity';
import { isUniqueViolation } from '../database/utils/is-unique-violation';
import { mapDevice } from '../customers/utils/map-device';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceTelemetryDto } from './dto/update-device-telemetry.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    @InjectRepository(DeviceModel)
    private readonly deviceModelRepo: Repository<DeviceModel>,
  ) {}

  async create(data: CreateDeviceDto) {
    const deviceModel = await this.deviceModelRepo.findOne({
      where: { id: data.id_deviceModel },
    });

    if (!deviceModel) {
      throw new NotFoundException(`Device model ${data.id_deviceModel} not found`);
    }

    if (deviceModel.iccidRequired && !data.iccid?.trim()) {
      throw new BadRequestException('ICCID is required for this device model');
    }

    try {
      const device = await this.deviceRepo.save({
        idDevice: data.id_device,
        deviceModelId: data.id_deviceModel,
        iccid: data.iccid?.trim() || null,
        imei: data.imei?.trim() || null,
        motorType: data.motorType,
        batteryType: data.batteryType,
        os: data.os,
        firmwareVersion: data.firmwareVersion,
      });

      const created = await this.deviceRepo.findOneOrFail({
        where: { id: device.id },
        relations: { deviceModelRef: true },
      });

      return mapDevice(created);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'Device with this id_device and model, or imei, already exists',
        );
      }
      throw error;
    }
  }

  async listModels() {
    const models = await this.deviceModelRepo.find({
      order: { id: 'ASC' },
    });

    return {
      resultList: models.map((model) => ({
        id_deviceModel: model.id,
        name: model.name,
      })),
    };
  }

  async updateTelemetry(imei: string, data: UpdateDeviceTelemetryDto) {
    const device = await this.deviceRepo.findOne({
      where: { imei },
      relations: { deviceModelRef: true },
    });

    if (!device) {
      throw new NotFoundException(`Device with imei ${imei} not found`);
    }

    device.geo = data.geo;
    device.batteryState = data.batteryState;
    device.batteryType = data.batteryType;
    device.firmwareVersion = data.firmwareVersion;

    const updated = await this.deviceRepo.save(device);

    return mapDevice(updated);
  }
}
