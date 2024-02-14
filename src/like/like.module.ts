import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Like } from './entity/like.entity';
import { PostEntity } from 'src/post/entities/post.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Book } from 'src/book/entities/book.entity';
import { Session } from 'src/session/entities/session.entity';
import { Forgot } from 'src/forgot/entities/forgot.entity';
import { CommentEntity } from '../comment/entity/comment.entity';
import { GatewayModule } from 'src/sockets/gateway/gateway.module';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      Like,
      PostEntity,
      User,
      Book,
      Session,
      Forgot,
      CommentEntity,
    ]),
    GatewayModule,
  ],
  controllers: [LikeController],
  providers: [LikeService, UsersService],
})
export class LikeModule {}
