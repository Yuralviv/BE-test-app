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
import { DeviceWithModel, mapDevice } from '../customers/utils/map-device';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceTelemetryDto } from './dto/update-device-telemetry.dto';

const DEFAULT_DEVICE_MODEL_ID = 7;

function resolveIccid(iccid: string | undefined): string {
  return iccid?.trim() || '';
}

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    @InjectRepository(DeviceModel)
    private readonly deviceModelRepo: Repository<DeviceModel>,
  ) {}

  async registerFromDevice(data: RegisterDeviceDto) {
    const imei = data.imei.trim();
    if (!imei) {
      throw new BadRequestException('imei is required');
    }

    const idDevice = data.id_device?.trim() || imei;
    const deviceModelId = data.id_deviceModel ?? DEFAULT_DEVICE_MODEL_ID;

    const deviceModel = await this.deviceModelRepo.findOne({
      where: { id: deviceModelId },
    });

    if (!deviceModel) {
      throw new NotFoundException(`Device model ${deviceModelId} not found`);
    }

    const existing = await this.deviceRepo.findOne({
      where: { imei },
      relations: { deviceModelRef: true },
    });

    if (existing) {
      return mapDevice(await this.applyOptionalFields(existing, data));
    }

    try {
      const device = await this.deviceRepo.save({
        idDevice,
        deviceModelId,
        iccid: resolveIccid(data.iccid),
        imei,
        batteryType: data.batteryType,
        os: data.os,
        firmwareVersion: data.firmwareVersion,
        geo: data.geo,
        batteryState: data.batteryState,
      });

      const created = await this.deviceRepo.findOneOrFail({
        where: { id: device.id },
        relations: { deviceModelRef: true },
      });

      return mapDevice(created);
    } catch (error) {
      if (isUniqueViolation(error)) {
        const byImei = await this.deviceRepo.findOne({
          where: { imei },
          relations: { deviceModelRef: true },
        });

        if (byImei) {
          return mapDevice(await this.applyOptionalFields(byImei, data));
        }

        throw new ConflictException(
          'Device with this id_device and model, or imei, already exists',
        );
      }
      throw error;
    }
  }

  async findAll() {
    const devices = await this.deviceRepo.find({
      relations: { deviceModelRef: true },
      order: { id: 'ASC' },
    });

    return devices.map((device) => mapDevice(device as DeviceWithModel));
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
    const normalizedImei = imei.trim();
    let device = await this.deviceRepo.findOne({
      where: { imei: normalizedImei },
      relations: { deviceModelRef: true },
    });

    if (!device) {
      device = await this.deviceRepo.save({
        idDevice: normalizedImei,
        deviceModelId: DEFAULT_DEVICE_MODEL_ID,
        iccid: '',
        imei: normalizedImei,
        geo: data.geo,
        batteryState: data.batteryState,
        batteryType: data.batteryType,
        firmwareVersion: data.firmwareVersion,
      });

      device = await this.deviceRepo.findOneOrFail({
        where: { id: device.id },
        relations: { deviceModelRef: true },
      });
    } else {
      device.geo = data.geo;
      device.batteryState = data.batteryState;
      device.batteryType = data.batteryType;
      device.firmwareVersion = data.firmwareVersion;

      device = await this.deviceRepo.save(device);
    }

    return mapDevice(device as DeviceWithModel);
  }

  private async applyOptionalFields(
    device: Device,
    data: RegisterDeviceDto,
  ): Promise<DeviceWithModel> {
    if (data.iccid?.trim()) {
      device.iccid = data.iccid.trim();
    }
    if (data.batteryType) {
      device.batteryType = data.batteryType;
    }
    if (data.os) {
      device.os = data.os;
    }
    if (data.firmwareVersion) {
      device.firmwareVersion = data.firmwareVersion;
    }
    if (data.geo) {
      device.geo = data.geo;
    }
    if (data.batteryState) {
      device.batteryState = data.batteryState;
    }

    const updated = await this.deviceRepo.save(device);

    return this.deviceRepo.findOneOrFail({
      where: { id: updated.id },
      relations: { deviceModelRef: true },
    }) as Promise<DeviceWithModel>;
  }
}
