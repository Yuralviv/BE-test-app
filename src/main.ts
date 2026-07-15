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
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const publicUrl =
    process.env.RAILWAY_PUBLIC_DOMAIN != null
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : process.env.SWAGGER_SERVER_URL;

  const swaggerConfigBuilder = new DocumentBuilder()
    .setTitle('Motocaddy BE API')
    // .setDescription(
    //   [
    //     'Backend for the Motocaddy device board and CRM.',
    //     '',
    //     '**Auth (CRM)**',
    //     '- `POST /auth/crm/login` — login for MANAGER / ADMIN (returns access + refresh tokens)',
    //     '- `POST /auth/crm/refresh` — get new access token from refresh token',
    //     '- `GET /auth/crm/me` — current user profile (Bearer token)',
    //     '- `PATCH /auth/crm/reset-password` — change password (Bearer token)',
    //     '- `POST /auth/crm/registration` — create MANAGER user (**ADMIN only**)',
    //     '',
    //     '**Admins** — requires ADMIN token',
    //     '- `GET /admins/all` — list CRM staff (MANAGER + ADMIN)',
    //     '',
    //     '**Customers (board)** — requires CRM token (MANAGER or ADMIN)',
    //     '- `GET /customers?page=1&limit=20` — paginated list with devices',
    //     '- `GET /customers/search?q={term}` — search by email, iccid or imei',
    //     '',
    //     '**Devices**',
    //     '- `PUT /devices/:imei` — update geo, batteryState, batteryType, firmwareVersion',
    //     '',
    //     'All successful responses are wrapped as `{ data: ... }`.',
    //     'Paginated customer list also returns `{ meta: { page, limit, total, totalPages } }`.',
    //   ].join('\n'),
    // )
    // .setVersion('1.0')
    // .addBearerAuth()
    // .addTag('auth', 'CRM registration, login, refresh and profile')
    // .addTag('admins', 'CRM staff management (admin only)')
    // .addTag('customers', 'Board list, pagination and global search')
    // .addTag('devices', 'Device telemetry updates');

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
