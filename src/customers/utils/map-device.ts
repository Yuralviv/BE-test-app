import { Device } from '../../database/entities/device.entity';
import { CustomerWithDevices } from '../data/mock-customers';

export type DeviceWithModel = Device & {
  deviceModelRef: NonNullable<Device['deviceModelRef']>;
};

export function mapDevice(
  device: DeviceWithModel,
): CustomerWithDevices['devices'][number] {
  return {
    id: device.id,
    iccid: device.iccid ?? '',
    imei: device.imei ?? '',
    deviceModel: device.deviceModelRef?.name ?? '',
    motorType: device.motorType,
    batteryType: device.batteryType,
    os: device.os,
    firmwareVersion: device.firmwareVersion,
    geo: device.geo,
    batteryState: device.batteryState,
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
  };
}
