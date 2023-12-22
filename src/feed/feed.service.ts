import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from 'src/post/entities/post.entity';
import { Server } from 'socket.io';

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
    private readonly server: Server,

    private readonly commentService: CommentService,
    private readonly postService: PostService,
    private readonly usersService: UsersService,
  ) {}

  //searching feed items
  async getFeed(currentUserId: number) {
    const user = await this.usersService.findOne({ id: currentUserId }, [
      'subscribers',
    ]);
    if (!user) {
      throw new UnauthorizedException('You must be autorized');
    }
    const subscribersIds = user.subscribers.map((sub) => sub.id);

    const feedItems = await this.postRepository.find({
      order: { createdAt: 'DESC' },
      relations: {
        author: true,
        comments: true,
      },
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

          const commentsCount = comments.length;
          //comments directly to the post  with likes
          const parrentComments = comments.filter(
            (comment) => comment.parentId === null,
          );

          console.log('parrentComments', parrentComments);

          const repliesToComments = parrentComments
            .map((parentComment) => {
              const replies = comments.filter(
                (comment) => comment.parentId === parentComment.id,
              );
              return replies;
            })
            .flat();

          // console.log('repliesToComment', repliesToComments);
          //post likes count
          const likeCountPost = await this.likeRepository
            .createQueryBuilder('like')
            .where('like.postId = :postId', { postId: item.id })
            .getCount();
            
          //   this.server.emit('likeCountUpdated', { postId: item.id, likeCount: likeCountPost });
          // console.log('likeCountPost', likeCountPost);

          return {
            postId: item.id,
            caption: item.caption,
            imgUrl: item.imgUrl,
            commentsCount,
            likeCount: likeCountPost,
            createAt: item.createdAt,
            updatedAt: item.updatedAt,
            author: {
              id: item.author.id,
              avatar: item.author.avatarUrl,
              firstName: item.author.firstName,
              lastName: item.author.lastName,
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
              userId: com.userId,
              likeCount: com.likeCount,
              createdAt: com.createdAt,
              updatedAt: com.updatedAt,
              comments: repliesToComments
                .filter((reply) => reply.parentId === com.id)
                .map((filterReply) => ({
                  id: filterReply.id,
                  text: filterReply.text,
                  parrentId: filterReply.parentId,
                  postId: filterReply.postId,
                  userId: filterReply.userId,
                  likeCount: filterReply.likeCount,
                  createdAt: filterReply.createdAt,
                  updatedAt: filterReply.updatedAt,
                })),
            })),
          };
        }),
        
    );

    const posts = formattedFeedItems;
      //  this.server.emit('GetPosts', posts);
    return {posts};
  }
}
