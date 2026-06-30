import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import {
  BatteryStateDto,
  GeoDto,
} from '../../customers/dto/customer-response.dto';

export class UpdateDeviceTelemetryDto {
  @ApiProperty({ type: GeoDto, example: { lat: 50.45, lng: 30.52 } })
  @ValidateNested()
  @Type(() => GeoDto)
  geo: GeoDto;

  @ApiProperty({
    type: BatteryStateDto,
    example: { level: 87, charging: false },
  })
  @ValidateNested()
  @Type(() => BatteryStateDto)
  batteryState: BatteryStateDto;

  @ApiProperty({ example: 'Lithium' })
  @IsString()
  batteryType: string;

  @ApiProperty({ example: '2.4.1' })
  @IsString()
  firmwareVersion: string;
}
