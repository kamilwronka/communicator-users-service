import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { UserServersModule } from './users/modules/user-servers/user-servers.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UsersModule,
    RouterModule.register([
      {
        path: 'users',
        module: UsersModule,
        children: [{ path: 'servers', module: UserServersModule }],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
