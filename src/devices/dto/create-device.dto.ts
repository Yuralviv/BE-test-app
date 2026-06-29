import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ example: '89300123456789012345' })
  @IsString()
  iccid: string;

  @ApiProperty({ example: '123456789012345' })
  @IsString()
  imei: string;

  @ApiProperty({ example: 'Model-X' })
  @IsString()
  deviceModel: string;

  @ApiProperty({ example: 'BLDC' })
  @IsString()
  motorType: string;

  @ApiProperty({ example: 'Li-ion' })
  @IsString()
  batteryType: string;
}
