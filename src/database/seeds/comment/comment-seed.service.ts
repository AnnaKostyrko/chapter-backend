import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CommentEntity } from 'src/comment/entity/comment.entity';
import { PostEntity } from 'src/post/entities/post.entity';

@Injectable()
export class CommentSeedService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async seedCommentsForPost(post: PostEntity, user: User, count: number) {
    const comments: CommentEntity[] = [];
    for (let i = 1; i <= count; i++) {
      const newComment = this.commentRepository.create({
        text: `CommentText${i}`,
        post: post,
        user: user,
      });

      const savedComment = await this.commentRepository.save(newComment);
      comments.push(savedComment);
    }
    return comments;
  }

  async seedCommentsForComment(
    parentComment: CommentEntity,
    user: User,
    count: number,
  ) {
    const comments: CommentEntity[] = [];

    for (let i = 1; i <= count; i++) {
      const newComment = this.commentRepository.create({
        text: `CommentText${i}`,
        user: user,
        parentId: parentComment.id,
        postId: parentComment.postId,
      });

      comments.push(newComment);
    }

    await this.commentRepository.save(comments);

    return comments;
  }
}
