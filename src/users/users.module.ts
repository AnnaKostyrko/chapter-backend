import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { Book } from './entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Book])],
  controllers: [UsersController],
  providers: [IsExist, IsNotExist, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
