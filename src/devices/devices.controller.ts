import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { DeviceDataResponseDto } from './dto/device-response.dto';
import { UpdateDeviceTelemetryDto } from './dto/update-device-telemetry.dto';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Put(':imei')
  @ApiOperation({
    summary: 'Update device telemetry: geo, batteryState, batteryType, firmwareVersion',
  })
  @ApiParam({ name: 'imei', example: '869091030624950' })
  @ApiOkResponse({ type: DeviceDataResponseDto })
  @ApiNotFoundResponse({ description: 'Device not found' })
  updateTelemetry(
    @Param('imei') imei: string,
    @Body() data: UpdateDeviceTelemetryDto,
  ) {
    return this.devicesService.updateTelemetry(imei, data);
  }
}
