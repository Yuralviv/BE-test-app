import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class DeviceAuthContextDto {
  @ApiProperty({ example: 'DEV-12345' })
  @IsString()
  @IsNotEmpty()
  id_device: string;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  id_deviceModel: number;

  @ApiPropertyOptional({ example: '8944501234567890123' })
  @IsOptional()
  @IsString()
  iccid?: string;
}

export class DeviceRegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(15)
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @MaxLength(25)
  lastName: string;

  @ApiProperty({ example: 'john.smith@motocaddy.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+44123456789' })
  @IsString()
  @MaxLength(15)
  phoneNumber: string;

  @ApiProperty({ example: 'pass1234' })
  @IsString()
  @MinLength(4)
  @MaxLength(15)
  password: string;

  @ApiProperty({ example: 'DEV-12345' })
  @IsString()
  @IsNotEmpty()
  id_device: string;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  id_deviceModel: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  termsAgreed: boolean;

  @ApiPropertyOptional({ example: '8944501234567890123' })
  @IsOptional()
  @IsString()
  iccid?: string;

  @ApiPropertyOptional({ example: '1 Main Street' })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(45)
  address2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(45)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(17)
  postalCode?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  marketingTermsAgreed?: boolean;
}

export class DeviceLoginDto {
  @ApiProperty({ example: 'john.smith@motocaddy.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'pass1234' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'DEV-ASSIGNED' })
  @IsString()
  @IsNotEmpty()
  id_device: string;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  id_deviceModel: number;

  @ApiPropertyOptional({ example: '8944509876543210001' })
  @IsOptional()
  @IsString()
  iccid?: string;
}

export class DeviceUnassignDto {
  @ApiProperty({ example: 'DEV-TEST-001' })
  @IsString()
  @IsNotEmpty()
  id_device: string;

  @ApiProperty({ example: 'cmrepi34j00018fn78vlhbmvu' })
  @IsString()
  @IsNotEmpty()
  id_user: string;
}
