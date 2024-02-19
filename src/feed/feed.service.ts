import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from 'src/post/entities/post.entity';

import { CommentService } from 'src/comment/comment.service';
import { UsersService } from 'src/users/users.service';
import { PostService } from 'src/post/post.service';
import { Like } from 'src/like/entity/like.entity';
import { transformPostInfo } from 'src/post/ helpers/post.transform';

@Injectable()
export class FeedService {
  FeedGateway: any;
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    private readonly commentService: CommentService,
    private readonly postService: PostService,
    private readonly usersService: UsersService,
  ) {}

  //searching feed items
  async getFeed(currentUserId: number, page: number, limit: number) {
    const user = await this.usersService.findOne({ id: currentUserId });
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
      .orderBy('post.createdAt', 'DESC')
      .getMany();

    const transformedResponse = transformPostInfo(postsInfo, user, true);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFeedItems = transformedResponse.slice(startIndex, endIndex);

    return paginatedFeedItems;
  }
}
