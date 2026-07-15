import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { DeviceAuthService } from './device-auth.service';
import { CrmRegistrationDto } from './dto/crmRegistration.dto';
import { LoginDto } from './dto/login.dto';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { CrmAuthGuard, CrmAuthRequest } from './guards/crm-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  CrmLoginDataResponseDto,
  CrmRefreshDataResponseDto,
  CrmRegistrationDataResponseDto,
  CrmUserProfileDataResponseDto,
  MessageDataResponseDto,
} from './dto/crm-login-response.dto';
import { DeviceLoginDto, DeviceRegisterDto, DeviceUnassignDto } from './dto/device-auth.dto';
import { DeviceAuthDataResponseDto } from './dto/device-auth-response.dto';
import {
  DeviceSecretKeyGuard,
  DeviceAuthRequest,
} from './guards/device-secret-key.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly deviceAuthService: DeviceAuthService,
  ) {}

  @Post('crm/registration')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Create a new CRM user (admin only)',
    description:
      'Creates a MANAGER or ADMIN account. Requires admin JWT (`aud: crm`, role ADMIN).',
  })
  @ApiCreatedResponse({ type: CrmRegistrationDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRM token' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  crmRegister(@Body() data: CrmRegistrationDto) {
    return this.authService.crmRegistration(data);
  }

  @Post('crm/login')
  @ApiOperation({
    summary: 'CRM login for managers and admins',
    description:
      'Returns access and refresh tokens. CUSTOMER role cannot log in to CRM.',
  })
  @ApiOkResponse({ type: CrmLoginDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiForbiddenResponse({ description: 'CRM access is restricted to managers' })
  crmLogin(@Body() data: LoginDto) {
    return this.authService.crmLogin(data);
  }

  @Get('crm/me')
  @ApiBearerAuth()
  @UseGuards(CrmAuthGuard)
  @ApiOperation({ summary: 'Get current CRM user profile from token' })
  @ApiOkResponse({ type: CrmUserProfileDataResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid CRM token' })
  @ApiForbiddenResponse({ description: 'CRM access is restricted to managers' })
  crmMe(@Req() req: CrmAuthRequest) {
    return this.authService.crmMe(req.user.id);
  }

  @Post('crm/refresh')
  @ApiOperation({
    summary: 'Refresh CRM access token',
    description: 'Exchange a valid refresh token for a new access token.',
  })
  @ApiOkResponse({ type: CrmRefreshDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @ApiForbiddenResponse({ description: 'CRM access is restricted to managers' })
  crmRefresh(@Body() data: RefreshTokenDto) {
    return this.authService.crmRefresh(data);
  }

  @Patch('crm/reset-password')
  @ApiBearerAuth()
  @UseGuards(CrmAuthGuard)
  @ApiOperation({ summary: 'Change password for the current CRM user' })
  @ApiOkResponse({ type: MessageDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid CRM token, or wrong current password',
  })
  @ApiForbiddenResponse({ description: 'CRM access is restricted to managers' })
  crmResetPassword(
    @Req() req: CrmAuthRequest,
    @Body() data: ResetPasswordDto,
  ) {
    return this.authService.crmResetPassword(req.user.id, data);
  }

  @Post('device/register')
  @ApiOperation({
    summary: 'Register customer and assign device (trolley)',
    description:
      'Device must exist in the whitelist (pre-provisioned in the system). Returns username and secretKey for request signatures.',
  })
  @ApiOkResponse({ type: DeviceAuthDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed or ICCID required' })
  @ApiNotFoundResponse({ description: 'Device not whitelisted' })
  @ApiGoneResponse({ description: 'Email already registered' })
  deviceRegister(@Body() data: DeviceRegisterDto) {
    return this.deviceAuthService.register(data);
  }

  @Post('device/login')
  @ApiOperation({
    summary: 'Login customer with device (trolley)',
    description:
      'Device must be whitelisted and assigned to the user. Returns a new secretKey.',
  })
  @ApiOkResponse({ type: DeviceAuthDataResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed or ICCID required' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or device not assigned' })
  @ApiNotFoundResponse({ description: 'Device not whitelisted' })
  deviceLogin(@Body() data: DeviceLoginDto) {
    return this.deviceAuthService.login(data);
  }

  @Post('device/unassign')
  @ApiBearerAuth()
  @UseGuards(DeviceSecretKeyGuard)
  @ApiOperation({
    summary: 'Unassign device from user',
    description:
      'Requires device secretKey from login/register in Authorization header. Sets device userId back to null.',
  })
  @ApiOkResponse({ type: MessageDataResponseDto })
  @ApiUnauthorizedResponse({ description: 'Device not assigned to user' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  deviceUnassign(
    @Req() req: DeviceAuthRequest,
    @Body() data: DeviceUnassignDto,
  ) {
    return this.deviceAuthService.unassign(req.user.id, data);
  }
}
