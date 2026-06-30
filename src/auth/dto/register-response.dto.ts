import { ApiProperty } from '@nestjs/swagger';
import { CustomerWithDevicesResponseDto } from '../../customers/dto/customer-response.dto';

export class RegisterResponseDto {
  @ApiProperty({ type: CustomerWithDevicesResponseDto })
  data: CustomerWithDevicesResponseDto;
}
