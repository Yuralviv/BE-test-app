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
import { DeviceOs } from '../database/enums/device-os.enum';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceTelemetryDto } from './dto/update-device-telemetry.dto';

const DEFAULT_DEVICE_MODEL_ID = 7;
const DEFAULT_GEO = { lat: 0, lng: 0 };
const DEFAULT_BATTERY_STATE = { level: 0, charging: false };

function resolveIccid(iccid: string | undefined): string {
  return iccid?.trim() || '';
}

function deviceTimestamps() {
  const now = new Date();
  return { createdAt: now, updatedAt: now };
}

function resolveRegisterFields(data: RegisterDeviceDto) {
  return {
    batteryType: data.batteryType ?? 'Lithium',
    os: data.os ?? DeviceOs.LINUX,
    firmwareVersion: data.firmwareVersion ?? '0.0.0',
    geo: data.geo ?? DEFAULT_GEO,
    batteryState: data.batteryState ?? DEFAULT_BATTERY_STATE,
  };
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
      const fields = resolveRegisterFields(data);
      const device = await this.deviceRepo.save({
        idDevice,
        deviceModelId,
        iccid: resolveIccid(data.iccid),
        imei,
        ...fields,
        ...deviceTimestamps(),
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

        const byIdDevice = await this.deviceRepo.findOne({
          where: { idDevice, deviceModelId },
          relations: { deviceModelRef: true },
        });

        if (byIdDevice) {
          return mapDevice(await this.applyOptionalFields(byIdDevice, data));
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
        os: DeviceOs.LINUX,
        ...deviceTimestamps(),
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
