import { ApiProperty } from '@nestjs/swagger';
import { DeviceOs } from '../../database/enums/device-os.enum';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty({ example: '8944501234567890123' })
  @IsString()
  iccid: string;

  @ApiProperty({ example: '869091030624950' })
  @IsString()
  imei: string;

  @ApiProperty({ example: 'M7 GPS' })
  @IsString()
  deviceModel: string;

  @ApiProperty({ example: '28V' })
  @IsString()
  motorType: string;

  @ApiProperty({ example: 'Lithium' })
  @IsString()
  batteryType: string;

  @ApiProperty({ enum: DeviceOs, example: DeviceOs.ANDROID })
  @IsEnum(DeviceOs)
  os: DeviceOs;

  @ApiProperty({ example: '2.4.1' })
  @IsString()
  firmwareVersion: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.smith@motocaddy.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ type: RegisterDeviceDto })
  @ValidateNested()
  @Type(() => RegisterDeviceDto)
  device: RegisterDeviceDto;
}
