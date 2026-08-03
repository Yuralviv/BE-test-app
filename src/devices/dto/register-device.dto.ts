import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DeviceOs } from '../../database/enums/device-os.enum';
import {
  BatteryStateDto,
  GeoDto,
} from '../../customers/dto/customer-response.dto';

export class RegisterDeviceDto {
  @ApiProperty({
    example: '869091030624950',
    description: 'Device IMEI — used for telemetry updates via PUT /devices/:imei',
  })
  @IsString()
  @IsNotEmpty()
  imei: string;

  @ApiPropertyOptional({
    example: 'DEV-TEST-001',
    description: 'Defaults to imei when omitted',
  })
  @IsOptional()
  @IsString()
  id_device?: string;

  @ApiPropertyOptional({
    example: 7,
    description: 'Defaults to model 7 (M7 GPS) when omitted',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_deviceModel?: number;

  @ApiPropertyOptional({ example: '8944501234567890123' })
  @IsOptional()
  @IsString()
  iccid?: string;

  @ApiPropertyOptional({ example: '28V' })
  @IsOptional()
  @IsString()
  motorType?: string;

  @ApiPropertyOptional({ example: 'Lithium' })
  @IsOptional()
  @IsString()
  batteryType?: string;

  @ApiPropertyOptional({ enum: DeviceOs, example: DeviceOs.ANDROID })
  @IsOptional()
  @IsEnum(DeviceOs)
  os?: DeviceOs;

  @ApiPropertyOptional({ example: '2.4.1' })
  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @ApiPropertyOptional({ type: GeoDto, example: { lat: 50.45, lng: 30.52 } })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoDto)
  geo?: GeoDto;

  @ApiPropertyOptional({
    type: BatteryStateDto,
    example: { level: 87, charging: false },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BatteryStateDto)
  batteryState?: BatteryStateDto;
}
