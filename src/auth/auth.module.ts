import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeviceAuthService } from './device-auth.service';
import { CrmAuthGuard } from './guards/crm-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { DeviceSecretKeyGuard } from './guards/device-secret-key.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    DeviceAuthService,
    CrmAuthGuard,
    AdminAuthGuard,
    DeviceSecretKeyGuard,
  ],
  exports: [
    AuthService,
    DeviceAuthService,
    CrmAuthGuard,
    AdminAuthGuard,
    DeviceSecretKeyGuard,
  ],
})
export class AuthModule {}
