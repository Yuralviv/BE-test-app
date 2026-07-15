import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device, DeviceModel, User } from './entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL') ?? process.env.DATABASE_URL,
        entities: [User, Device, DeviceModel],
        synchronize: false,
        logging: config.get<string>('environment') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([User, Device, DeviceModel]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
