import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { GatewayModule } from 'src/sockets/gateway/gateway.module';
import { Session } from 'src/session/entities/session.entity';
import { NotaService } from 'src/nota/nota.service';
import { Nota } from 'src/nota/entities/nota.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Book, Session, Nota]),
    GatewayModule,
  ],
  controllers: [BookController],
  providers: [BookService, UsersService, NotaService],
})
export class BookModule {}
