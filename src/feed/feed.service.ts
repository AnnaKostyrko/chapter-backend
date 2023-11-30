import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from 'src/post/entities/post.entity';
import { Server } from 'socket.io';
import { LikeService } from 'src/like/like.service';
import { CommentService } from 'src/comment/comment.service';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly server: Server,
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
    private readonly usersService: UsersService,
  ) {}

  //searching feed items
  async getFeed(currentUserId: number) {
    const feedItems = await this.postRepository.find({
      order: { createdAt: 'DESC' },
      relations: {
        author: true,
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
      feedItems.map(async (item) => {
        const comments = await this.commentService.GetComments(item.id, {
          text: item.comments,
        });

        const likedComment= await this.likeService.getLikedUsers(item.id);

        const likePost = await this.likeService.togglePostLike(item.id, item.author.id  )

        const followStatus = await this.usersService.toggleSubscription(
          item.author.id,
          currentUserId,
        );

        return {
          postId: item.id,
          caption: item.caption,
          imgUrl: item.imgUrl,
          comment:{
            comments,
            likedComments: likedComment,
          },
          likePost,
          followStatus: followStatus.subscribers.some(
            (subscriber) => subscriber.id === item.author.id,
          ),
          createAt: item.createdAt,
          author: {
            id: item.author.id,
            avatar: item.author.avatarUrl,
            firstName: item.author.firstName,
            lastName: item.author.lastName,
            relativeDate: timeDifference(new Date(), new Date(item.createdAt)),
          },
        };
      }),
    );

    const posts = formattedFeedItems;

    this.server.emit('GetPosts', posts);

    return {
      posts,
    };
  }
}