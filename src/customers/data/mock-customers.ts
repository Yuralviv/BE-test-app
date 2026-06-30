export type Geo = {
  lat: number;
  lng: number;
};

export type BatteryState = {
  level: number;
  charging: boolean;
};

export type DeviceOs = 'ANDROID' | 'LINUX';

export type Device = {
  id: number;
  iccid: string;
  imei: string;
  deviceModel: string;
  motorType: string;
  batteryType: string;
  os: DeviceOs;
  firmwareVersion: string;
  geo: Geo;
  batteryState: BatteryState;
  createdAt: string;
  updatedAt: string;
};

export type CustomerWithDevices = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  devices: Device[];
};

export type CustomerSeed = CustomerWithDevices & {
  password: string;
};

export const MOCK_CUSTOMERS: CustomerSeed[] = [
  {
    id: 'cust-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@motocaddy.com',
    password: 'password123',
    devices: [
      {
        id: 101,
        iccid: '8944501234567890123',
        imei: '869091030624950',
        deviceModel: 'M7 GPS',
        motorType: '28V',
        batteryType: 'Lithium',
        os: 'ANDROID',
        firmwareVersion: '2.4.1',
        geo: { lat: 51.5074, lng: -0.1278 },
        batteryState: { level: 78, charging: false },
        createdAt: '2024-03-12T10:30:00.000Z',
        updatedAt: '2026-06-28T14:22:00.000Z',
      },
      {
        id: 102,
        iccid: '8944501234567890999',
        imei: '869091030624951',
        deviceModel: 'M5',
        motorType: '24V',
        batteryType: 'Lead-acid',
        os: 'LINUX',
        firmwareVersion: '1.8.0',
        geo: { lat: 51.4545, lng: -0.9781 },
        batteryState: { level: 42, charging: true },
        createdAt: '2024-08-01T09:15:00.000Z',
        updatedAt: '2026-06-29T08:10:00.000Z',
      },
      {
        id: 103,
        iccid: '8944509876543210001',
        imei: '869091030624952',
        deviceModel: 'M7 GPS',
        motorType: '28V',
        batteryType: 'Lithium',
        os: 'ANDROID',
        firmwareVersion: '2.5.0',
        geo: { lat: 52.4862, lng: -1.8904 },
        batteryState: { level: 91, charging: false },
        createdAt: '2025-01-20T16:45:00.000Z',
        updatedAt: '2026-06-30T11:05:00.000Z',
      },
    ],
  },
  {
    id: 'cust-2',
    firstName: 'Anna',
    lastName: 'Kovalenko',
    email: 'anna.k@example.com',
    password: 'password123',
    devices: [
      {
        id: 201,
        iccid: '8944505555555555555',
        imei: '359876543210001',
        deviceModel: 'M3',
        motorType: '12V',
        batteryType: 'Lead-acid',
        os: 'LINUX',
        firmwareVersion: '1.6.3',
        geo: { lat: 50.4501, lng: 30.5234 },
        batteryState: { level: 55, charging: false },
        createdAt: '2023-11-05T12:00:00.000Z',
        updatedAt: '2026-06-27T19:30:00.000Z',
      },
      {
        id: 202,
        iccid: '8944506666666666666',
        imei: '359876543210002',
        deviceModel: 'M5',
        motorType: '24V',
        batteryType: 'Lithium',
        os: 'ANDROID',
        firmwareVersion: '2.3.2',
        geo: { lat: 50.4547, lng: 30.5166 },
        batteryState: { level: 33, charging: false },
        createdAt: '2024-05-18T08:20:00.000Z',
        updatedAt: '2026-06-25T07:45:00.000Z',
      },
    ],
  },
  {
    id: 'cust-3',
    firstName: 'David',
    lastName: 'Williams',
    email: 'd.williams@golfclub.co.uk',
    password: 'password123',
    devices: [
      {
        id: 301,
        iccid: '8944507777777777777',
        imei: '491020123456789',
        deviceModel: 'M7 GPS',
        motorType: '28V',
        batteryType: 'Lithium',
        os: 'LINUX',
        firmwareVersion: '2.1.0',
        geo: { lat: 53.4808, lng: -2.2426 },
        batteryState: { level: 67, charging: true },
        createdAt: '2022-09-30T14:00:00.000Z',
        updatedAt: '2026-06-29T22:15:00.000Z',
      },
    ],
  },
];
