import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common/pipes';
import { LoggerService } from './core/logger/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(LoggerService));
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const publicUrl =
    process.env.RAILWAY_PUBLIC_DOMAIN != null
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : process.env.SWAGGER_SERVER_URL;

  const swaggerConfigBuilder = new DocumentBuilder()
    .setTitle('Motocaddy BE API')
    .setDescription(
      [
        'Backend for the Motocaddy device board and mobile registration flow.',
        '',
        '**Auth**',
        '- `POST /auth/register` — register customer and bind the device used for signup',
        '',
        '**Customers (board)**',
        '- `GET /customers?page=1&limit=20` — paginated list with all devices per customer',
        '- `GET /customers/search?q={term}` — global search by email, iccid or imei',
        '',
        '**Devices**',
        '- `PUT /devices/:imei` — update geo, batteryState, batteryType, firmwareVersion from device',
        '',
        'All successful responses are wrapped as `{ data: ... }`. Paginated list also returns `{ meta: { page, limit, total, totalPages } }`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addTag('auth', 'Customer registration with device binding')
    .addTag('customers', 'Board list, pagination and global search')
    .addTag('devices', 'Device telemetry updates');

  if (publicUrl) {
    swaggerConfigBuilder.addServer(publicUrl, 'Production');
  }

  swaggerConfigBuilder.addServer('http://localhost:3001', 'Local');

  const swaggerConfig = swaggerConfigBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  const host = `0.0.0.0`;
  await app.listen(port, host);
}
bootstrap();
