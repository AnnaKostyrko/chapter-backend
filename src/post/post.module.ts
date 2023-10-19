import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Like } from 'src/like/entity/like.entity';
import { CommentEntity } from 'src/comment/entity/comment.entity';
@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, User, Like, CommentEntity])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
