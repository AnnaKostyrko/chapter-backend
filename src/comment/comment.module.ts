import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([CommentEntity, User, PostEntity]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
