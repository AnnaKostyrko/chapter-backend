import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CommentEntity } from './entity/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { User } from '../users/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';
import { CommentResponse } from './interfaces';
import { createResponse } from 'src/helpers/response-helpers';
import { transformPostInfo } from 'src/post/ helpers/post.transform';

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
  ): Promise<DeepPartial<PostEntity>> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    const post = await this.postRepository.findOneOrFail({
      where: { id: postId },
      relations: ['comments'],
    });
    console.log('post', post);
    const comment = this.commentRepository.create({
      ...commentData,
      user,
      post,
    });

    await this.commentRepository.save(comment);

    const updatedPost = await this.deepGetPostById(postId);

    const transUpdatedPost = transformPostInfo([updatedPost], user);

    return transUpdatedPost[0];
  }

  async update(
    currentUserId: number,
    commentId: number,
    updateData: UpdateCommentDto,
  ): Promise<CommentEntity> {
    console.log('currentUserId', currentUserId);
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, user: { id: currentUserId } },
    });

    if (!comment) {
      throw new NotFoundException(
        'You don`t have permission to update this comment',
      );
    }

    comment.text = updateData.text;

    await this.commentRepository.save(comment);

    return comment;
  }

  async commentToComment(
    userId: number,
    commentId: number,
    commentData: CreateCommentDto,
  ): Promise<DeepPartial<PostEntity>> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });

    const comment = await this.commentRepository.findOneOrFail({
      where: { id: commentId },
    });

    const commentToComment = this.commentRepository.create({
      ...commentData,
      parentId: comment.parentId ? comment.parentId : comment.id,
      postId: comment.postId,
      user,
    });
    await this.commentRepository.save(commentToComment);

    const updatedPost = await this.deepGetPostById(comment.postId);

    const transUpdatedPost = transformPostInfo([updatedPost], user);

    return transUpdatedPost[0];
  }

    async getCommentsByPost(
      postId: number,
      page: number,
      limit: number,
    ): Promise<CommentResponse> {
      const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comment')
      .where('post.id = :postId', {postId})
      .getOne();
      
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const query = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .where('post.id = :postId', { postId })
      .take(limit)
      .skip((page - 1) * limit);

    const [comments, totalCount] = await query.getManyAndCount()

    return { comments, totalComments: totalCount };
  }

  async getCommentToComment(commentToCommentId: number) {
    const commentsToComment = await this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.id')
      .where(`comment.parentId=${commentToCommentId}`)
      .getRawMany();

    if (!commentsToComment) {
      throw new NotFoundException('Comment-to-comment not found');
    }

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
        'like.userId as like_user_id',
      ])
      .where(`comment.postId=${postId}`)
      .groupBy('comment.id, like.userId')
      .getRawMany();

    if (!commentsToPost) {
      throw new NotFoundException('Comment to post not found');
    }

    const commentsWithUsers = await Promise.all(
      commentsToPost.map(async (comment) => {
        const user = await this.userRepository.findOne({
          where: { id: comment.user_id },
        });

        const likeIds = commentsToPost
          .filter((c) => c.id === comment.id && c.like_user_id !== null)
          .map((c) => c.like_user_id);

        return {
          id: comment.id,
          parentId: comment.parent_id,
          text: comment.text,
          postId: comment.post_id,
          user,
          createdAt: comment.created_at,
          updatedAt: comment.updated_at,
          likeIds,
        };
      }),
    );

    return commentsWithUsers;
  }

  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOneOrFail({
      where: {
        id: commentId,
      },
    });

    if (comment.userId !== userId) {
      throw createResponse(HttpStatus.FORBIDDEN, 'Insufficient permissions.');
    }

    await this.commentRepository.remove(comment);
  }

  private async deepGetPostById(postId: number): Promise<PostEntity> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.author', 'author')
      .addSelect([
        'author.id',
        'author.avatarUrl',
        'author.firstName',
        'author.lastName',
        'author.nickName',
      ])
      .leftJoinAndSelect('post.likes', 'like')
      .leftJoinAndSelect('post.comments', 'comment')
      .leftJoinAndSelect('comment.user', 'commentAuthor')
      .leftJoinAndSelect('comment.likes', 'likes')
      .where('post.id = :postId', { postId })
      .orderBy('post.createdAt', 'DESC')
      .getOneOrFail();
  }
}
