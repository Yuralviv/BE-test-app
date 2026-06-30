import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a customer and bind the device used for registration',
  })
  @ApiOkResponse({ type: RegisterResponseDto })
  @ApiConflictResponse({
    description: 'Email or device imei is already registered',
  })
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }
}
