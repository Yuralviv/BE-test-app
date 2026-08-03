import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CrmAuthGuard } from '../auth/guards/crm-auth.guard';
import { DeviceModelListResponseDto } from '../auth/dto/device-auth-response.dto';
import { DevicesService } from './devices.service';
import { DeviceDataResponseDto } from './dto/device-response.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceTelemetryDto } from './dto/update-device-telemetry.dto';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(CrmAuthGuard)
  @ApiOperation({ summary: 'List all devices (CRM)' })
  @ApiOkResponse({ description: 'Device list wrapped as { data: Device[] } by response interceptor' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRM token' })
  findAll() {
    return this.devicesService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Register device (open, no auth — temporary for dev)',
    description:
      'Device self-registration without user or whitelist. Idempotent by imei. ' +
      'Optional geo/batteryState on first ping. Updates via PUT /devices/:imei.',
  })
  @ApiCreatedResponse({ type: DeviceDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Device model not found' })
  @ApiConflictResponse({ description: 'Device id conflict' })
  register(@Body() data: RegisterDeviceDto) {
    return this.devicesService.registerFromDevice(data);
  }

  @Post('models')
  @ApiOperation({ summary: 'List available Motocaddy device models' })
  @ApiOkResponse({ type: DeviceModelListResponseDto })
  listModels() {
    return this.devicesService.listModels();
  }

  @Get('models')
  @ApiOperation({ summary: 'List available Motocaddy device models (GET alias)' })
  @ApiOkResponse({ type: DeviceModelListResponseDto })
  listModelsGet() {
    return this.devicesService.listModels();
  }

  @Put(':imei')
  @ApiOperation({
    summary: 'Update device telemetry (open, no auth — temporary for dev)',
    description:
      'Updates geo, batteryState, batteryType, firmwareVersion. Creates device by imei if missing.',
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
