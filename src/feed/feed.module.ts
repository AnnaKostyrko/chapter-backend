import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from 'src/post/entities/post.entity';
import { Book } from 'src/book/entities/book.entity';
import { User } from 'src/users/entities/user.entity';
import { Server } from 'socket.io';
import { PostService } from 'src/post/post.service';
// import { FeedGateway } from './gateway/feet.gateway';
import { Like } from 'src/like/entity/like.entity';
import { CommentEntity } from 'src/comment/entity/comment.entity';
import { LikeService } from 'src/like/like.service';
import { CommentService } from 'src/comment/comment.service';
import { UsersService } from 'src/users/users.service';
import { Session } from 'src/session/entities/session.entity';
import { Forgot } from 'src/forgot/entities/forgot.entity';
import { GatewayModule } from 'src/sockets/gateway/gateway.module';
import { NotaService } from 'src/nota/nota.service';
import { Nota } from 'src/nota/entities/nota.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      User,
      Book,
      Like,
      CommentEntity,
      Session,
      Forgot,
      Nota,
    ]),
    GatewayModule,
  ],
  providers: [
    FeedService,
    Server,
    PostService,
    LikeService,
    CommentService,
    UsersService,
    NotaService,
  ],
  controllers: [FeedController],
})
export class FeedModule {}
