import { ApiProperty } from '@nestjs/swagger';
import {
  BatteryStateDto,
  DeviceResponseDto,
  GeoDto,
} from '../../customers/dto/customer-response.dto';

export { DeviceResponseDto, GeoDto, BatteryStateDto };

export class DeviceDataResponseDto {
  @ApiProperty({ type: DeviceResponseDto })
  data: DeviceResponseDto;
}
