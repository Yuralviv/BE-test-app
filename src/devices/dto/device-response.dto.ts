import { ApiProperty } from '@nestjs/swagger';

export class DeviceResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '89300123456789012345' })
  iccid: string;

  @ApiProperty({ example: '123456789012345' })
  imei: string;

  @ApiProperty({ example: 'Model-X' })
  deviceModel: string;

  @ApiProperty({ example: 'BLDC' })
  motorType: string;

  @ApiProperty({ example: 'Li-ion' })
  batteryType: string;

  @ApiProperty({ example: { lat: 50.45, lng: 30.52 } })
  geo: Record<string, unknown>;

  @ApiProperty({ example: { level: 87, charging: false } })
  batteryState: Record<string, unknown>;

  @ApiProperty({ example: '2026-06-29T10:39:14.770Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-29T10:39:14.798Z' })
  updatedAt: Date;
}

export class DeviceDataResponseDto {
  @ApiProperty({ type: DeviceResponseDto })
  data: DeviceResponseDto;
}

export class DeviceListResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  data: DeviceResponseDto[];
}
