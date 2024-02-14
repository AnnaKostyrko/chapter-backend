import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserSeedService } from './user-seed.service';
import { Book } from 'src/book/entities/book.entity';
import { BookSeedService } from '../book/book-seed.service';
import { PostSeedService } from '../post/post-seed.service';
import { PostEntity } from 'src/post/entities/post.entity';
import { CommentEntity } from 'src/comment/entity/comment.entity';
import { CommentSeedService } from '../comment/comment-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Book, PostEntity, CommentEntity])],
  providers: [
    UserSeedService,
    BookSeedService,
    PostSeedService,
    CommentSeedService,
  ],
  exports: [UserSeedService],
})
export class UserSeedModule {}
