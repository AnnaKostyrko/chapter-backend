import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Book } from 'src/users/entities/book.entity';
import { Forgot } from '../forgot/entities/forgot.entity';
import { Session } from 'src/session/entities/session.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { Like } from 'src/like/entity/like.entity';
import { GatewayModule } from 'src/sockets/gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Book, Session, Forgot, PostEntity, Like]),
    GatewayModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, UsersService],
})
export class TaskModule {}
