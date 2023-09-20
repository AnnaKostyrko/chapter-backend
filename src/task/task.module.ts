import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Book } from 'src/users/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Book])],
  controllers: [TaskController],
  providers: [TaskService, UsersService],
})
export class TaskModule {}
