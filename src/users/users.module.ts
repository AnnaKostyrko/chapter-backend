import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { Book } from '../book/entities/book.entity';

import { GatewayModule } from 'src/sockets/gateway/gateway.module';

import { NotaService } from 'src/nota/nota.service';
import { Nota } from 'src/nota/entities/nota.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, Book, Nota]),
    GatewayModule,
  ],
  controllers: [UsersController],
  providers: [IsExist, IsNotExist, UsersService, JwtStrategy, NotaService],
  exports: [UsersService],
})
export class UsersModule {}
