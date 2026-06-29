import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateDeviceTelemetryDto {
  @ApiProperty({ example: { lat: 50.45, lng: 30.52 } })
  @IsObject()
  geo: Record<string, unknown>;

  @ApiProperty({ example: { level: 87, charging: false } })
  @IsObject()
  batteryState: Record<string, unknown>;
}
