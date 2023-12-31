import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CommentEntity } from './entity/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/comment.dto';
import { User } from '../users/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';
import { CommentResponse } from './interfaces';
import { createResponse } from 'src/helpers/response-helpers';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}

  async create(
    commentData: CreateCommentDto,
    postId: number,
    userId: number,
  ): Promise<CommentEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const comment = this.commentRepository.create({
      ...commentData,
      user,
      post,
    });

    return this.commentRepository.save(comment);
  }

  async update(
    commentId: number,
    updateData: UpdateCommentDto,
  ): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    comment.text = updateData.text;

    await this.commentRepository.save(comment);

    return comment;
  }

  async commentToComment(
    userId: number,
    commentId: number,
    commentData: CreateCommentDto,
  ): Promise<CommentEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const commentToComment = this.commentRepository.create({
      ...commentData,
      parentId: comment.id,
      postId: comment.postId,
      user,
    });
    return this.commentRepository.save(commentToComment);
  }

  // async getRepliesToComment(
  //   commentId: number,
  //   commentData: CreateCommentDto,
  // )  {

  //   const comment = await this.commentRepository.findOne({
  //     where: { id: commentId },
  //   });

  //   if (!comment) {
  //     throw new NotFoundException('Comment not found');
  //   }

  //   const replies = await this.commentRepository.findOne({
  //     where: {
  //         ...commentData,
  //     parentId: comment?.id,
  //     },
  //   });
  //   return { comment , replies };
  // }

  async getCommentsByPost(
    postId: number,
    page: number,
    limit: number,
  ): Promise<CommentResponse> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['comments'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = post.comments;
    const totalCount = comments.length;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedComments = comments.slice(startIndex, endIndex);

    return { comments: paginatedComments, totalComments: totalCount };
  }

  //15
  async getCommentToComment(commentToCommentId: number) {
    const commentsToComment = await this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.id')
      .where(`comment.parentId=${commentToCommentId}`)
      .getRawMany();

    if (!commentsToComment) {
      throw new NotFoundException('Comment-to-comment not found');
    }
    console.log('commentsToComment', commentsToComment);
    return commentsToComment;
  }

  async getCommentsToPostForFeed(postId: number): Promise<Array<any>> {
    const commentsToPost = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.likes', 'like')
      .select([
        'comment.id as id',
        'comment.parentId as parent_id',
        'comment.text as text',
        'comment.postId as post_id',
        'comment.userId as user_id',
        'comment.createdAt as created_at',
        'comment.updatedAt as updated_at',
        'COUNT(like.id) as like_count',
      ])
      .where(`comment.postId=${postId}`)
      .groupBy('comment.id')
      .getRawMany();

    if (!commentsToPost) {
      throw new NotFoundException('Comment to post not found');
    }

    return commentsToPost.map((comment) => ({
      id: comment.id,
      parentId: comment.parent_id,
      text: comment.text,
      postId: comment.post_id,
      userId: comment.user_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      likeCount: parseInt(comment.like_count),
    }));
  }

  async deleteComment(commentId: number, parentId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
        parentId,
      },
    });

    if (!comment) {
      throw createResponse(HttpStatus.NOT_FOUND, 'Comment not found.');
    }

    await this.commentRepository.remove(comment);
  }
}
