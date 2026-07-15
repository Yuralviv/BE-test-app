import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { DeviceModelListResponseDto } from '../auth/dto/device-auth-response.dto';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceDataResponseDto } from './dto/device-response.dto';
import { UpdateDeviceTelemetryDto } from './dto/update-device-telemetry.dto';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Add device to whitelist (admin only)',
    description:
      'Pre-provision a device so it can be used for device register/login. Device is created without a user.',
  })
  @ApiCreatedResponse({ type: DeviceDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed or ICCID required' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRM token' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Device model not found' })
  @ApiConflictResponse({ description: 'Device already exists' })
  create(@Body() data: CreateDeviceDto) {
    return this.devicesService.create(data);
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
