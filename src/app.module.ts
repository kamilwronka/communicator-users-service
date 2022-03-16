import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';

import { configService } from './config/config.service';
import { UserServersModule } from './users/modules/user-servers/user-servers.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        return configService.getTypeOrmConfig();
      },
    }),
    UsersModule,
    RouterModule.register([
      {
        path: 'users',
        module: UsersModule,
        children: [{ path: 'servers', module: UserServersModule }],
      },
    ]),
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
