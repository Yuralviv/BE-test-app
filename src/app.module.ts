import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [CoreModule, DevicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
