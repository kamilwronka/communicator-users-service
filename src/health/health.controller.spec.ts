import { ConfigService } from '@nestjs/config';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckServiceMock: HealthCheckService;
  let configServiceMock: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({ database: 'database' }),
          },
        },
        { provide: HealthCheckService, useValue: { check: jest.fn() } },
        { provide: TypeOrmHealthIndicator, useValue: { pingCheck: jest.fn() } },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckServiceMock = module.get<HealthCheckService>(HealthCheckService);
    configServiceMock = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should run health check function', () => {
      controller.check();

      expect(healthCheckServiceMock.check).toHaveBeenCalled();
      expect(configServiceMock.get).toHaveBeenCalledWith('postgres');
    });
  });
});
