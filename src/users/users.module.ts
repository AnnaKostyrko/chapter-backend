import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { Book } from './entities/book.entity';

import { GatewayModule } from 'src/sockets/gateway/gateway.module';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, Book]),
    GatewayModule,
  ],
  controllers: [UsersController],
  providers: [IsExist, IsNotExist, UsersService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
