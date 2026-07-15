import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceOs } from '../../database/enums/device-os.enum';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ example: 'DEV-TEST-001' })
  @IsString()
  @IsNotEmpty()
  id_device: string;

  @ApiProperty({ example: 7, description: 'Device model id (see POST /devices/models)' })
  @Type(() => Number)
  @IsInt()
  id_deviceModel: number;

  @ApiPropertyOptional({ example: '8944501234567890123' })
  @IsOptional()
  @IsString()
  iccid?: string;

  @ApiPropertyOptional({ example: '869091030624950' })
  @IsOptional()
  @IsString()
  imei?: string;

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
}
