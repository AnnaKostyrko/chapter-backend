import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
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

  async getUsersWhoLikedPost(
    userId: number,
    postId: number,
  ): Promise<DeepPartial<User[]>> {
    const currentUser = await this.usersRepository.findOneOrFail({
      where: { id: userId },
      relations: ['subscribers'],
    });

    const post = await this.postRepository.findOneOrFail({
      where: { id: postId },
    });

    const allUsers = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin(Like, 'like', 'like.userId=user.id')
      .where('like.postId=:postId', { postId: post.id })
      .andWhere('user.id != :userId', { userId: userId })
      .getMany();

    const response = allUsers.map((user) => ({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      userStatus: user.userStatus,
      location: user.location,
      avatarUrl: user.avatarUrl,
      isSubscribed: currentUser.subscribers.some((sub) => sub.id === user.id),
    }));
    return response;
  }

  async getLikedAndComentedPosts(
    currentUserId: number,
    page: number,
    limit: number,
  ) {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: currentUserId },
      relations: ['subscribers'],
    });

    const postInfo = await this.postRepository
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
      .where('like.userId = :userId OR comment.userId = :userId', {
        userId: user.id,
      })
      .orderBy('post.createdAt', 'DESC')
      .getMany();

    const response = postInfo.map((post) => ({
      postId: post.id,
      title: post.title,
      caption: post.caption,
      imgUrl: post.imgUrl,
      createAt: post.createdAt,
      updatedAt: post.updatedAt,
      commentsCount: post.comments.length,
      userIds: post.likes.map((like) => like.userId),
      author: {
        id: post.author.id,
        avatar: post.author.avatarUrl,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        nickName: post.author.nickName,
      },
      isSubscribeToAuthor: user.subscribers.some(
        (sub) => sub.id === post.author.id,
      ),
      comments: post.comments
        .filter((com) => com.parentId === null)
        .map((com) => ({
          id: com.id,
          text: com.text,
          postId: com.postId,
          commentCount: post.comments.filter((c) => c.parentId === com.id)
            .length,
          author: {
            id: com.user.id,
            avatar: com.user.avatarUrl,
            firstName: com.user.firstName,
            lastName: com.user.lastName,
            nickName: com.user.nickName,
          },
          usersId: com.likes.map((like) => like.userId),
          createdAt: com.createdAt,
          updatedAt: com.updatedAt,
          comments: post.comments
            .filter((c) => c.parentId === com.id)
            .map((reply) => ({
              id: reply.id,
              text: reply.text,
              parrentId: reply.parentId,
              postId: reply.postId,
              author: {
                id: reply.user.id,
                avatar: reply.user.avatarUrl,
                firstName: reply.user.firstName,
                lastName: reply.user.lastName,
                nickName: reply.user.nickName,
              },
              userIds: reply.likes.map((like) => like.userId),
              createdAt: reply.createdAt,
              updatedAt: reply.updatedAt,
            })),
        })),
    }));

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = response.slice(startIndex, endIndex);

    return paginatedPosts;
  }
}
