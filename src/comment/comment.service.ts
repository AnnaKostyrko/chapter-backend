import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CommentEntity } from './entity/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto, GetCommentsDto } from './dto/comment.dto';
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
  async GetComments(postId: number, commentData: GetCommentsDto) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error(`Post with id: ${postId} not found`);
    }

    const comments = await this.commentRepository.find({
      where: {
        postId: post.id,
        text: commentData.text,
      },
    });

    return { post, comments };
  }

  async deleteComment(commentId: number,parentId:number): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { 
      id: commentId,
      parentId } });

    if (!comment) {
      throw createResponse(HttpStatus.NOT_FOUND, 'Comment not found.');
    }

    await this.commentRepository.remove(comment);
  }

  async getCommentToComment(parentId: number, commentData: GetCommentsDto)  {
    const commentsToComment = await this.commentRepository.find({
      where: {
        parentId: parentId,
      },
    });
  
    if (!commentsToComment || commentsToComment.length === 0) {
      return [];
    }
  
    return commentsToComment.map(comment => ({
      id: comment.id,
      text: comment.text,
    }));
  }
  
}

