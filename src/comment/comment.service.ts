import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentEntity } from './entity/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import {
  CommentToCommentDto,
  PostCommentDto,
  UpdateCommentDto,
} from './dto/comment.dto';
import { User } from '../users/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';

import {
  transformComments,
  transformPostInfo,
} from 'src/post/ helpers/post.transform';

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
    commentData: PostCommentDto,
    postId: number,
    userId: number,
  ): Promise<DeepPartial<PostEntity>> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['subscribers'],
    });

    const post = await this.postRepository.findOneOrFail({
      where: { id: postId },
      relations: ['comments'],
    });

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
    const comment = await this.commentRepository.findOneOrFail({
      where: { id: commentId, user: { id: currentUserId } },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { text, ...rest } = updateData;

    if (Object.keys(rest).length === 2) {
      const recepient = await this.userRepository.findOne({
        where: {
          id: updateData.recipientId,
          nickName: updateData.recipientNickName,
        },
      });

      if (!recepient) {
        throw new ConflictException("you can't tag a user that doesn't exist");
      }
    }

    Object.assign(comment, updateData);

    return await this.commentRepository.save(comment);
  }

  async commentToComment(
    userId: number,
    commentId: number,
    commentData: CommentToCommentDto,
  ): Promise<DeepPartial<PostEntity>> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['subscribers'],
    });

    const comment = await this.commentRepository.findOneOrFail({
      where: { id: commentId },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { text, ...rest } = commentData;

    if (Object.keys(rest).length === 2) {
      const recepient = await this.userRepository.findOne({
        where: {
          id: commentData.recipientId,
          nickName: commentData.recipientNickName,
        },
      });

      if (!recepient) {
        throw new ConflictException("you can't tag a user that doesn't exist");
      }
    }

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

  async getCommentsByPost(postId: number, page: number, limit: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['comments'],
    });

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'commentAuthor')
      .leftJoinAndSelect('comment.likes', 'likes')
      .where('comment.postId=:postId', { postId })
      .orderBy('comment.createdAt', 'ASC')
      .getMany();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const formatedComment = transformComments(comments);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedComments = formatedComment.slice(startIndex, endIndex);

    return paginatedComments;
  }

  async getCommentToComment(commentToCommentId: number) {
    const commentsToComment = await this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.id')
      .where(`comment.parentId=${commentToCommentId}`)
      .getMany();

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

  async deleteComment(
    commentId: number,
    userId: number,
  ): Promise<DeepPartial<PostEntity>> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['subscribers'],
    });

    const comment = await this.commentRepository.findOneOrFail({
      where: {
        id: commentId,
        user: { id: userId },
      },
    });
    const replies = await this.commentRepository.find({
      where: { parentId: commentId },
    });

    for (const replie of replies) {
      await this.commentRepository.remove(replie);
    }

    await this.commentRepository.remove(comment);

    const updatedPost = await this.deepGetPostById(comment.postId);
    const transUpdatedPost = transformPostInfo([updatedPost], user);
    return transUpdatedPost[0];
  }

  async deepGetPostById(postId: number): Promise<PostEntity> {
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
      .orderBy('comment.createdAt', 'DESC')
      .getOneOrFail();
  }
}
