import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';

import { AppModule } from './app.module';
import { configService } from './config/config.service';

async function bootstrap() {
  await configService.setup(['ENV', 'PORT']);

  const port = configService.getPort();

  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(json({ limit: '5mb' }));

  Logger.log(`Starting application on port ${port}...`);

  const config = new DocumentBuilder()
    .setTitle('Users service API')
    .setDescription('Users service API')
    .setVersion(process.env.npm_package_version)
    .addTag('users') //to be set
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
