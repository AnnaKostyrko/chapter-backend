import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entity/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity])],
})
export class CommentModule {}
