import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import {
  DeviceDataResponseDto,
  DeviceListResponseDto,
} from './dto/device-response.dto';
import { UpdateDeviceTelemetryDto } from './dto/update-device-telemetry.dto';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new device' })
  @ApiOkResponse({ type: DeviceDataResponseDto })
  @ApiConflictResponse({ description: 'Device with this imei already exists' })
  create(@Body() data: CreateDeviceDto) {
    return this.devicesService.create(data);
  }

  @Put(':imei')
  @ApiOperation({ summary: 'Update device geo and batteryState' })
  @ApiParam({ name: 'imei', example: '123456789012345' })
  @ApiOkResponse({ type: DeviceDataResponseDto })
  @ApiNotFoundResponse({ description: 'Device not found' })
  updateTelemetry(
    @Param('imei') imei: string,
    @Body() data: UpdateDeviceTelemetryDto,
  ) {
    return this.devicesService.updateTelemetry(imei, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices for the board' })
  @ApiOkResponse({ type: DeviceListResponseDto })
  findAll() {
    return this.devicesService.findAll();
  }
}
