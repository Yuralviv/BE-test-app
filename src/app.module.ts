import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { CustomersModule } from './customers/customers.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [CoreModule, AuthModule, CustomersModule, DevicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
