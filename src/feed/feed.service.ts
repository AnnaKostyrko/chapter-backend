import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from 'src/post/entities/post.entity';
import { Server } from 'socket.io';
import { LikeService } from 'src/like/like.service';
import { CommentService } from 'src/comment/comment.service';
import { UsersService } from 'src/users/users.service';
import { PostService } from 'src/post/post.service';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly server: Server,
    private readonly likeService: LikeService,
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
          const { comments } = await this.commentService.GetComments(item.id);

          const commentsCount = comments.length;
          //comments directly to the post  with likes
          const parrentComments = await Promise.all(
            comments
              .filter((comment) => comment.parentId === null)
              .map(async (comment) => {
                const likedUsers = await this.likeService.getLikedUsersComment(
                  comment,
                );
                return {
                  ...comment,
                  likeCount: likedUsers.length,
                };
              }),
          );

          //unique parrent ids
          const uniqueCommentsParentIds = comments
            .filter((comment) => comment.parentId !== null)
            .map((comment) => comment.parentId)
            .filter((value, index, self) => self.indexOf(value) === index);

          const repliesToComment = await Promise.all(
            uniqueCommentsParentIds.map(async (parentId) => {
              const commentsToComment =
                await this.commentService.getCommentToCommentForFeed(parentId);

              return {
                parrentCommentId: parentId,

                commentsToComment: await Promise.all(
                  commentsToComment.map(async (comment) => {
                    const likedUsers =
                      await this.likeService.getLikedUsersComment(comment);

                    return {
                      ...comment,
                      likeCount: likedUsers.length,
                    };
                  }),
                ),
              };
            }),
          );

          //post likes count
          const likeCountPost = (
            await this.postService.getUsersWhoLikedPost(item.id)
          ).length;

          return {
            postId: item.id,
            caption: item.caption,
            imgUrl: item.imgUrl,
            commentsCount,
            likeCount: likeCountPost,
            createAt: item.createdAt,
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
            comments: {
              parrentComments,
              repliesToComment: repliesToComment ?? null,
            },
          };
        }),
    );

    const posts = formattedFeedItems;

    this.server.emit('GetPosts', posts);

    return posts;
  }
}
