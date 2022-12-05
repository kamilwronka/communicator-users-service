import { registerAs } from '@nestjs/config';
import { RabbitMqConfig } from './types';

export default registerAs('rabbitmq', (): RabbitMqConfig => {
  const {
    RABBITMQ_USER,
    RABBITMQ_PASSWORD,
    RABBITMQ_HOST,
    RABBITMQ_ACCESS_PORT,
  } = process.env;

  return {
    host: RABBITMQ_HOST,
    port: RABBITMQ_ACCESS_PORT,
    password: RABBITMQ_PASSWORD,
    user: RABBITMQ_USER,
  };
});
