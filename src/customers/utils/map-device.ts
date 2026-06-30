import { Device } from '@prisma/client';
import { CustomerWithDevices } from '../data/mock-customers';

export function mapDevice(
  device: Device,
): CustomerWithDevices['devices'][number] {
  return {
    id: device.id,
    iccid: device.iccid,
    imei: device.imei,
    deviceModel: device.deviceModel,
    motorType: device.motorType,
    batteryType: device.batteryType,
    os: device.os,
    firmwareVersion: device.firmwareVersion,
    geo: device.geo as CustomerWithDevices['devices'][number]['geo'],
    batteryState:
      device.batteryState as CustomerWithDevices['devices'][number]['batteryState'],
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
  };
}
