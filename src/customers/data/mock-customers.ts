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
  role?: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
};


export const MOCK_ADMIN: CustomerSeed = {
  id: 'cmrcrw1i400039wx9cjdni1v4',
  firstName: 'Yuri',
  lastName: 'Ivaniv',
  email: 'Yuri.Ivaniv@motocaddy.com',
  password: 'Motocaddy1',
  role: 'ADMIN',
  devices: [],
};

export const MOCK_MANAGER: CustomerSeed = {
  id: 'cmrcrw1i400039wx9cjdni1v5',
  firstName: 'Manager',
  lastName: 'User',
  email: 'manager@motocaddy.com',
  password: 'password123',
  role: 'MANAGER',
  devices: [],
};

export const MOCK_CUSTOMERS: CustomerSeed[] = [];