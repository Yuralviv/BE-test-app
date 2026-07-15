import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { AdminListResponseDto } from './dto/admin-response.dto';
import { AdminAuthGuard } from 'src/auth/guards/admin-auth.guard';

@ApiTags('admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'List all CRM staff (managers and admins)',
    description: 'Admin-only. Returns users with role MANAGER or ADMIN.',
  })
  @ApiOkResponse({ type: AdminListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRM token' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  findAll() {
    return this.adminsService.findAll();
  }
}
