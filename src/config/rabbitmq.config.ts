import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { registerAs } from '@nestjs/config';

export const DEFAULT_EXCHANGE_NAME = 'default';

export default registerAs('rabbitmq', (): RabbitMQConfig => {
  const {
    RABBITMQ_USER,
    RABBITMQ_PASSWORD,
    RABBITMQ_HOST,
    RABBITMQ_ACCESS_PORT,
  } = process.env;

  return {
    uri: `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_ACCESS_PORT}`,
    exchanges: [
      {
        name: DEFAULT_EXCHANGE_NAME,
        type: 'topic',
      },
    ],
    channels: {
      default: {
        prefetchCount: 1,
        default: true,
      },
    },
  };
});
