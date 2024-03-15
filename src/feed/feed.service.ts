import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from 'src/post/entities/post.entity';

import { UsersService } from 'src/users/users.service';

import { transformPostInfo } from 'src/post/ helpers/post.transform';

@Injectable()
export class FeedService {
  FeedGateway: any;
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,

    private readonly usersService: UsersService,
  ) {}

  //searching feed items
  async getFeed(currentUserId: number, page: number, limit: number) {
    const user = await this.usersService.findOne({ id: currentUserId }, [
      'subscribers',
    ]);

    if (!user) {
      throw new UnauthorizedException('You must be autorized');
    }

    const postsInfo: PostEntity[] = await this.postRepository
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
      .where('author.id != :currentUserId', { currentUserId })
      .andWhere('like.comment IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('comment.createdAt', 'DESC')
      .getMany();

    const transformedResponse = transformPostInfo(postsInfo, user);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFeedItems = transformedResponse.slice(startIndex, endIndex);

    return paginatedFeedItems;
  }
}
