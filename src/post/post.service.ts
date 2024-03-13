import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, Not } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { PostDto } from './dto/post.dto';
import { User } from '../users/entities/user.entity';
import { UpdatePostDto } from './dto/updatePost.dto';
import { Like } from 'src/like/entity/like.entity';

import { MyGateway } from 'src/sockets/gateway/gateway';
import { transformPostInfo } from './ helpers/post.transform';
import { notaUser } from 'src/nota/helpers/nota.user';
import { NotaService } from 'src/nota/nota.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private readonly myGateway: MyGateway,
    private readonly notaService: NotaService,
  ) {}

  async create(author: User, createPostDto: PostDto) {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: author.id },
    });
    const post = new PostEntity(createPostDto);

    post.author = user;

    const notificationMessage = 'New post';

    const users = await this.usersRepository.find({
      where: { id: Not(author.id) },
    });
    const newPost = await this.postRepository.save(post);
    for (const user of users) {
      await this.notaService.create(
        {
          message: notificationMessage,

          ...notaUser(post.author, newPost.id),
        },
        user,
      );
    }

    this.myGateway.sendNotificationToAllUsers(
      {
        ...notaUser(post.author, newPost.id),
      },
      notificationMessage,
    );

    return newPost;
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

  async getPost(postId: number): Promise<PostEntity> {
    const post = await this.postRepository.findOneOrFail({
      where: { id: postId },
    });
    return post;
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

    const postInfo: PostEntity[] = await this.postRepository
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
      .andWhere('like.comment IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .getMany();

    const transformedResponse = transformPostInfo(postInfo, user);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedPosts = transformedResponse.slice(startIndex, endIndex);

    return paginatedPosts;
  }
}
