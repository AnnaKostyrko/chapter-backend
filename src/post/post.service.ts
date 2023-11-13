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
import { CommentService } from 'src/comment/comment.service';

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

    private readonly commentService: CommentService,
  ) {}

  async create(author: User, createPostDto: PostDto) {
    const user = author;
    const post = new PostEntity();

    post.imgUrl = createPostDto.imageUrl;
    post.author = user;
    post.caption = createPostDto.caption;

    return await this.postRepository.save(post);
  }

  async updatePost(
    postId: number,
    updatePostDto: UpdatePostDto,
  ): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    post.caption = updatePostDto.caption;

    await this.postRepository.save(post);
  }

  async deletePost(postId: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw createResponse(HttpStatus.NOT_FOUND, 'Post not found.');
    }

    await this.postRepository.remove(post);
  }

  async getPostsByAuthor(author: User): Promise<PostEntity[]> {
    return await this.postRepository.find({
      where: { author: { id: author.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async getUsersWhoLikedPost(postId: number): Promise<object> {
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
      .where(`comment_entity.userId=${userId}`)
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
      .where('like.postId IN(:...postIds)', {
        postIds: postIds,
      })
      .getRawMany();

    const comments = await this.commentRepository
      .createQueryBuilder('comment_entity')
      .select([
        'COUNT(comment_entity.postId) as commentCount',
        'comment_entity.postId',
      ])
      .groupBy('comment_entity.postId')
      .where('comment_entity.postId IN(:...postIds)', {
        postIds: postIds,
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
