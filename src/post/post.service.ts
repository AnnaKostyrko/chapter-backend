import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { PostDto } from './dto/post.dto';
import { User } from '../users/entities/user.entity';
import { UpdatePostDto } from './dto/updatePost.dto';
import { Like } from 'src/like/entity/like.entity';
import { CommentEntity } from 'src/comment/entity/comment.entity';
import { MyGateway } from 'src/sockets/gateway/gateway';

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
    private readonly myGateway: MyGateway,
  ) {}

  async create(author: User, createPostDto: PostDto) {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: author.id },
    });
    const post = new PostEntity(createPostDto);

    post.author = user;

    this.myGateway.sendNotificationToAllUsers(author.id, 'New post');

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

    await this.postRepository.update(postId, updatePostDto);
  }

  async deletePost(userId: number, postId: number): Promise<void> {
    const post = await this.postRepository.findOneOrFail({
      where: { id: postId, author: { id: userId } },
    });

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
    const post = await this.postRepository.findOneOrFail({
      where: { id: postId },
    });

    const allUsers = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin(Like, 'like', 'like.userId=user.id')
      .where('like.postId=:postId', { postId: post.id })
      .getMany();

    return allUsers;
  }

  // async getLikedAndComentedPosts(userId: number) {
  //   const user = await this.usersRepository.findOneOrFail({
  //     where: { id: userId },
  //   });

  //   const commentedPostIds = await this.commentRepository
  //     .createQueryBuilder('comment_entity')
  //     .select('comment_entity.postId')
  //     .where('comment_entity.userId=:userId', { userId })
  //     .getMany();

  //   const likedPostIds = await this.likeRepository
  //     .createQueryBuilder('like')
  //     .select('like.postId')
  //     .where(`like.userId =${userId}`)
  //     .getMany();

  //   const allPostsIds = [...commentedPostIds, ...likedPostIds];

  //   const postIds = allPostsIds.map((post) => post.postId);

  //   const allPosts = await this.postRepository.find({
  //     where: { id: In(postIds) },
  //     relations: ['author'],
  //   });

  //   const likes = await this.likeRepository
  //     .createQueryBuilder('like')
  //     .select(['COUNT(like.postId) as likeCount', 'like.postId'])
  //     .groupBy('like.postId')
  //     .where('like.postId = ANY(:postIds)', { postIds })
  //     .getRawMany();

  //   const comments = await this.commentRepository
  //     .createQueryBuilder('comment_entity')
  //     .select([
  //       'COUNT(comment_entity.postId) as commentCount',
  //       'comment_entity.postId',
  //     ])
  //     .groupBy('comment_entity.postId')
  //     .where('comment_entity.postId = ANY(:postIds)', {
  //       postIds,
  //     })
  //     .getRawMany();

  //   const likedAndCommentedPosts = allPosts.map((post) => {
  //     const likeCount = likes.find((like) => like.like_postId === post.id);
  //     const commentCount = comments.find(
  //       (comment) => comment.comment_entity_postId === post.id,
  //     );
  //     return {
  //       postId: post.id,
  //       title: post.title,
  //       caption: post.caption,
  //       createdDate: post.createdAt,
  //       likesCount: likeCount ? likeCount.likecount : 0,
  //       commentCount: commentCount ? commentCount.commentcount : 0,
  //       postimage: post.imgUrl,
  //       author: {
  //         authorId: post.author.id,
  //         authorNickName: post.author.nickName,
  //         authorAvatar: post.author.avatarUrl,
  //       },
  //     };
  //   });

  //   return likedAndCommentedPosts;
  // }

  async getLikedAndComentedPosts(userId: number) {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
    });
    const posts = await this.postRepository
      .createQueryBuilder('post_entity')
      .select([
        'post_entity.id AS postId',
        'post_entity.imgUrl',
        'post_entity.title',
        'post_entity.caption',
        'COUNT(DISTINCT comment_entity.id) AS commentCount',
        'COUNT(DISTINCT like_entity.id) AS likeCount',
      ])
      .leftJoin('post_entity.comments', 'comment_entity')
      .leftJoin('post_entity.likes', 'like_entity')
      .where(
        'like_entity.userId = :userId OR comment_entity.userId = :userId',
        { userId: user.id },
      )
      .groupBy('post_entity.id')
      .getRawMany();

    return posts;
  }
}
