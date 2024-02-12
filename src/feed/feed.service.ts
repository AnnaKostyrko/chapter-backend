import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from 'src/post/entities/post.entity';

import { CommentService } from 'src/comment/comment.service';
import { UsersService } from 'src/users/users.service';
import { PostService } from 'src/post/post.service';
import { Like } from 'src/like/entity/like.entity';

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
    const user = await this.usersService.findOne({ id: currentUserId }, [
      'subscribers',
    ]);
    if (!user) {
      throw new UnauthorizedException('You must be autorized');
    }
    const subscribersIds = user.subscribers.map((sub) => sub.id);

    const feedItems = await this.postRepository.find({
      order: { createdAt: 'ASC' },
      relations: ['author', 'comments'],
    });

    // method whitch reflects the past tense
    const timeDifference = (current, previous) => {
      const msPerMinute = 60 * 1000;
      const msPerHour = msPerMinute * 60;
      const msPerDay = msPerHour * 24;
      const msPerMonth = msPerDay * 30;
      const msPerYear = msPerDay * 365;

      const elapsed = current - previous;

      if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
      } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
      } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
      } else if (elapsed < msPerMonth) {
        return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
      } else if (elapsed < msPerYear) {
        return (
          'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago'
        );
      } else {
        return (
          'approximately ' + Math.round(elapsed / msPerYear) + ' years ago'
        );
      }
    };

    const formattedFeedItems = await Promise.all(
      feedItems
        .filter((feedItem) => feedItem.author.id !== currentUserId)
        .map(async (item) => {
          const isSubscribeToAuthor = subscribersIds.includes(item.author.id);

          //all post's comments
          const comments = await this.commentService.getCommentsToPostForFeed(
            item.id,
          );

          const commentsToPostCount = comments.length;

          //comments directly to the post  with likes
          const parrentComments = comments.filter(
            (comment) => comment.parentId === null,
          );

          const repliesToComments = parrentComments
            .map((parentComment) => {
              const replies = comments.filter(
                (comment) => comment.parentId === parentComment.id,
              );
              return replies;
            })
            .flat();

          //post likes
          const postLikes = await this.likeRepository
            .createQueryBuilder('like')
            .select('like.userId')
            .where('like.postId = :postId', { postId: item.id })
            .andWhere('like.comment IS NULL')
            .getRawMany();

          return {
            title: item.title,
            postId: item.id,
            caption: item.caption,
            imgUrl: item.imgUrl,
            commentsCount: commentsToPostCount,
            userIds: postLikes.map((like) => like['like_userId']),
            createAt: item.createdAt,
            updatedAt: item.updatedAt,
            author: {
              id: item.author.id,
              avatar: item.author.avatarUrl,
              firstName: item.author.firstName,
              lastName: item.author.lastName,
              nickName: item.author.nickName,
              relativeDate: timeDifference(
                new Date(),
                new Date(item.createdAt),
              ),
            },
            isSubscribeToAuthor,
            comments: parrentComments.map((com) => ({
              id: com.id,
              text: com.text,
              postId: com.postId,
              commentCount: repliesToComments.filter(
                (reply) => reply.parentId === com.id,
              ).length,
              author: {
                id: com.user.id,
                avatar: com.user.avatarUrl,
                firstName: com.user.firstName,
                lastName: com.user.lastName,
                nickName: com.user.nickName,
              },
              usersId: com.likeIds,
              createdAt: com.createdAt,
              updatedAt: com.updatedAt,
              comments: repliesToComments
                .filter((reply) => reply.parentId === com.id)
                .map((filterReply) => ({
                  id: filterReply.id,
                  text: filterReply.text,
                  parrentId: filterReply.parentId,
                  postId: filterReply.postId,
                  author: {
                    id: filterReply.user.id,
                    avatar: filterReply.user.avatarUrl,
                    firstName: filterReply.user.firstName,
                    lastName: filterReply.user.lastName,
                    nickName: filterReply.user.nickName,
                  },
                  usersId: filterReply.likeIds,
                  createdAt: filterReply.createdAt,
                  updatedAt: filterReply.updatedAt,
                })),
            })),
          };
        }),
    );

    const posts = formattedFeedItems;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFeedItems = posts.slice(startIndex, endIndex);

    return { paginatedFeedItems };
  }
}
