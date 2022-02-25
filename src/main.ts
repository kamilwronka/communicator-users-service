import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { configService } from './config/config.service';

async function bootstrap() {
  const port = configService.getPort();
  const isProduction = configService.isProduction();
  const {
    host: rabbitMQHost,
    port: rabbitMQPort,
    user: rabbitMQUser,
    password: rabbitMQPassword,
  } = configService.getRabbitMQConfig();

  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${rabbitMQUser}:${rabbitMQPassword}@${rabbitMQHost}:${rabbitMQPort}/`,
      ],
      queue: 'users_service_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  Logger.log('Starting application using following config:');
  Logger.log(`Port: ${port}`);
  Logger.log(`Is production: ${isProduction}`);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
