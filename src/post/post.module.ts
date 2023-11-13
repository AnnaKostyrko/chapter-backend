import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Like } from 'src/like/entity/like.entity';
import { CommentEntity } from 'src/comment/entity/comment.entity';
import { Server } from 'socket.io';
import { FeedService } from 'src/feed/feed.service';
import { FeedGateway } from 'src/feed/gateway/feet.gateway';
import { LikeService } from 'src/like/like.service';
import { CommentService } from 'src/comment/comment.service';
import { UsersService } from 'src/users/users.service';
import { Book } from 'src/users/entities/book.entity';
import { Session } from 'src/session/entities/session.entity';
import { Forgot } from 'src/forgot/entities/forgot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      User,
      Like,
      CommentEntity,
      Book,
      Session,
      Forgot,
    ]),
  ],
  providers: [
    PostService,
    FeedGateway,
    Server,
    FeedService,
    LikeService,
    CommentService,
    UsersService,
  ],
  controllers: [PostController],
})
export class PostModule {}
