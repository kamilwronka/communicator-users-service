import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { configService } from 'src/config/config.service';

@Controller('healthz')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const config = configService.getConfig();

    return this.health.check([
      () => this.db.pingCheck(config.POSTGRES_DATABASE),
    ]);
  }
}
