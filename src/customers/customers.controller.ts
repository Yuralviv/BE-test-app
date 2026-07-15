import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CrmAuthGuard } from '../auth/guards/crm-auth.guard';
import { CustomersService } from './customers.service';
import {
  CustomerSearchResponseDto,
  PaginatedCustomerListResponseDto,
} from './dto/customer-search-response.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(CrmAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Global search by customer email, device iccid or imei' })
  @ApiQuery({ name: 'q', example: '869091030624950', required: true })
  @ApiOkResponse({ type: CustomerSearchResponseDto })
  @ApiBadRequestResponse({ description: 'Missing search query' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRM token' })
  @ApiForbiddenResponse({ description: 'CRM access is restricted to managers' })
  search(@Query('q') q?: string) {
    if (!q?.trim()) {
      throw new BadRequestException('Search query q is required');
    }

    return this.customersService.search(q);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated customers with their devices for the board' })
  @ApiQuery({ name: 'page', example: 1, required: false })
  @ApiQuery({ name: 'limit', example: 20, required: false })
  @ApiOkResponse({ type: PaginatedCustomerListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRM token' })
  @ApiForbiddenResponse({ description: 'CRM access is restricted to managers' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('limit must be between 1 and 100');
    }

    return this.customersService.findAll(page, limit);
  }
}
