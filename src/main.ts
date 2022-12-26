import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { json } from 'express';

import { AppModule } from './app.module';
import { AppConfig } from './config/types';
import { RuntimeEnvironment } from './types/common';
import { configureMockserver } from './users/__mocks__/configure-mockserver';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);

  const { port, jsonSizeLimit, env } = configService.get<AppConfig>('app', {
    infer: true,
  });

  app.use(json({ limit: jsonSizeLimit }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Users service API')
    .setDescription('Users service API')
    .setVersion(process.env.npm_package_version)
    .addBearerAuth()
    .addServer('/users')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  if (env === RuntimeEnvironment.LOCAL) {
    await configureMockserver();
  }

  Logger.log(`Starting application on port ${port}.`);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(port);
}
bootstrap();
