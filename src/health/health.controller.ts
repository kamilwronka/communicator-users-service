import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { PostgresConfig } from 'src/config/types';

@Controller('healthz')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const { database } = this.configService.get<PostgresConfig>('postgres');

    return this.health.check([() => this.db.pingCheck(database)]);
  }
}
