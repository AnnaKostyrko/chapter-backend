import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Like } from 'src/like/entity/like.entity';
import { CommentEntity } from 'src/comment/entity/comment.entity';
import { Server } from 'socket.io';
import { GatewayModule } from 'src/sockets/gateway/gateway.module';
import { CommentService } from 'src/comment/comment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, User, Like, CommentEntity]),
    GatewayModule,
  ],
  providers: [PostService, Server, CommentService],
  controllers: [PostController],
})
export class PostModule {}
