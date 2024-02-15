import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { GatewayModule } from 'src/sockets/gateway/gateway.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Book]), GatewayModule],
  controllers: [BookController],
  providers: [BookService, UsersService],
})
export class BookModule {}
