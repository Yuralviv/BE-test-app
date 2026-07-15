import { ApiProperty } from '@nestjs/swagger';
import { DeviceOs } from '../../database/enums/device-os.enum';
import { IsBoolean, IsNumber } from 'class-validator';

export class GeoDto {
  @ApiProperty({ example: 51.5074 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -0.1278 })
  @IsNumber()
  lng: number;
}

export class BatteryStateDto {
  @ApiProperty({ example: 78 })
  @IsNumber()
  level: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  charging: boolean;
}

export class DeviceResponseDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: '8944501234567890123' })
  iccid: string;

  @ApiProperty({ example: '869091030624950' })
  imei: string;

  @ApiProperty({ example: 'M7 GPS' })
  deviceModel: string;

  @ApiProperty({ example: '28V' })
  motorType: string;

  @ApiProperty({ example: 'Lithium' })
  batteryType: string;

  @ApiProperty({ enum: DeviceOs, example: DeviceOs.ANDROID })
  os: DeviceOs;

  @ApiProperty({ example: '2.4.1' })
  firmwareVersion: string;

  @ApiProperty({ type: GeoDto })
  geo: GeoDto;

  @ApiProperty({ type: BatteryStateDto })
  batteryState: BatteryStateDto;

  @ApiProperty({ example: '2024-03-12T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-06-28T14:22:00.000Z' })
  updatedAt: string;
}

export class CustomerWithDevicesResponseDto {
  @ApiProperty({ example: 'cust-1' })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  lastName: string;

  @ApiProperty({ example: 'john.smith@motocaddy.com' })
  email: string;

  @ApiProperty({ type: [DeviceResponseDto] })
  devices: DeviceResponseDto[];
}

export class CustomerListResponseDto {
  @ApiProperty({ type: [CustomerWithDevicesResponseDto] })
  data: CustomerWithDevicesResponseDto[];
}
