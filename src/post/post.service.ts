import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { PostDto } from './dto/post.dto';
import { User } from '../users/entities/user.entity';
import { UpdatePostDto } from './dto/updatePost.dto';
import { createResponse } from 'src/helpers/response-helpers';
import { Like } from 'src/like/entity/like.entity';
import { CommentEntity } from 'src/comment/entity/comment.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async create(author: User, createPostDto: PostDto) {
    const user = author;
    const post = new PostEntity();

    post.imgUrl = createPostDto.imageUrl ?? post.imgUrl;
    post.author = user;
    post.caption = createPostDto.caption ?? post.caption;
    post.title = createPostDto.title ?? post.title;

    return await this.postRepository.save(post);
  }

  async updatePost(
    userId: number,
    postId: number,
    updatePostDto: UpdatePostDto,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId, author: { id: userId } },
    });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    post.imgUrl = updatePostDto.imageUrl ?? post.imgUrl;

    post.caption = updatePostDto.caption ?? post.caption;
    post.title = updatePostDto.title ?? post.title;

    await this.postRepository.save(post);
  }

  async deletePost(userId: number, postId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId, author: { id: userId } },
    });

    if (!post) {
      throw createResponse(HttpStatus.NOT_FOUND, 'Post not found.');
    }

    await this.postRepository.remove(post);
  }

  async getPostsByAuthor(authorId: number): Promise<PostEntity[]> {
    return await this.postRepository.find({
      where: { author: { id: authorId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getUsersPosts(userId: number): Promise<PostEntity[]> {
    return await this.postRepository.find({
      where: { author: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getUsersWhoLikedPost(postId: number): Promise<User[]> {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    const allUsers = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin(Like, 'like', 'like.userId=user.id')
      .where('like.postId=:postId', { postId })
      .getMany();

    return allUsers;
  }

  async getLikedAndComentedPosts(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const commentedPostIds = await this.commentRepository
      .createQueryBuilder('comment_entity')
      .select('comment_entity.postId')
      .where('comment_entity.userId=:userId', { userId })
      .getMany();

    const likedPostIds = await this.likeRepository
      .createQueryBuilder('like')
      .select('like.postId')
      .where(`like.userId =${userId}`)
      .getMany();

    const allPostsIds = [...commentedPostIds, ...likedPostIds];

    const postIds = allPostsIds.map((post) => post.postId);

    const allPosts = await this.postRepository.find({
      where: { id: In(postIds) },
      relations: ['author'],
    });

    const likes = await this.likeRepository
      .createQueryBuilder('like')
      .select(['COUNT(like.postId) as likeCount', 'like.postId'])
      .groupBy('like.postId')
      .where('like.postId = ANY(:postIds)', { postIds })
      .getRawMany();

    const comments = await this.commentRepository
      .createQueryBuilder('comment_entity')
      .select([
        'COUNT(comment_entity.postId) as commentCount',
        'comment_entity.postId',
      ])
      .groupBy('comment_entity.postId')
      .where('comment_entity.postId = ANY(:postIds)', {
        postIds,
      })
      .getRawMany();

    const likedAndCommentedPosts = allPosts.map((post) => {
      const likeCount = likes.find((like) => like.like_postId === post.id);
      const commentCount = comments.find(
        (comment) => comment.comment_entity_postId === post.id,
      );
      return {
        postId: post.id,
        caption: post.caption,
        createdDate: post.createdAt,
        likesCount: likeCount ? likeCount.likecount : 0,
        commentCount: commentCount ? commentCount.commentcount : 0,
        postimage: post.imgUrl,
        author: {
          authorId: post.author.id,
          authorNickName: post.author.nickName,
          authorAvatar: post.author.avatarUrl,
        },
      };
    });

    return likedAndCommentedPosts;
  }
}
