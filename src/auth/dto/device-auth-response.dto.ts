import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeviceAuthResponseDto {
  @ApiProperty({ example: 'cust-seed-1' })
  id_user: string;

  @ApiProperty({ example: 'john_a1b2c3' })
  username: string;

  @ApiProperty({ example: 'f3a9c2e1b0d8476a9c2e1b0d8476a9c2e1b0d8476a9c2e1b0d8476a9c2' })
  secretKey: string;

  @ApiProperty({ example: false })
  emailVerified: boolean;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description:
      'Earliest time when a new verification code can be sent (yyMMddHHmmss). Null if allowed now.',
  })
  nextCodeSendAllowedAfter: string | null;
}

export class DeviceAuthDataResponseDto {
  @ApiProperty({ type: DeviceAuthResponseDto })
  data: DeviceAuthResponseDto;
}

export class DeviceModelItemDto {
  @ApiProperty({ example: 7 })
  id_deviceModel: number;

  @ApiProperty({ example: 'Motocaddy M7 GPS Electric Trolley' })
  name: string;
}

export class DeviceModelListDataResponseDto {
  @ApiProperty({ type: [DeviceModelItemDto] })
  resultList: DeviceModelItemDto[];
}

export class DeviceModelListResponseDto {
  @ApiProperty({ type: DeviceModelListDataResponseDto })
  data: DeviceModelListDataResponseDto;
}
