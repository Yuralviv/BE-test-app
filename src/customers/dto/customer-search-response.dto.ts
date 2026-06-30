import { ApiProperty } from '@nestjs/swagger';
import {
  CustomerWithDevicesResponseDto,
  DeviceResponseDto,
} from './customer-response.dto';

export type MatchedBy = 'email' | 'iccid' | 'imei';

export class SearchCustomerDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  lastName: string;

  @ApiProperty({ example: 'john.smith@motocaddy.com' })
  email: string;

  @ApiProperty({ example: 12 })
  deviceCount: number;
}

export class CustomerSearchResultDto {
  @ApiProperty({ type: SearchCustomerDto })
  customer: SearchCustomerDto;

  @ApiProperty({ type: [DeviceResponseDto] })
  devices: DeviceResponseDto[];

  @ApiProperty({ enum: ['email', 'iccid', 'imei'], example: 'imei' })
  matchedBy: MatchedBy;
}

export class CustomerSearchResponseDto {
  @ApiProperty({ type: [CustomerSearchResultDto] })
  data: CustomerSearchResultDto[];
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedCustomerListResponseDto {
  @ApiProperty({ type: [CustomerWithDevicesResponseDto] })
  data: CustomerWithDevicesResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
