
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PostEntity } from "src/post/entities/post.entity";
import { Server } from "socket.io";
import { PostService } from "src/post/post.service";
@Injectable()
export class FeedService {
constructor(
@InjectRepository(PostEntity)
private readonly postRepository: Repository<PostEntity>,
private readonly server:Server,
private readonly Gateway:Server,
private readonly postService:PostService
) { }

//searching feed items
async getFeed() {
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
    return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago';
  }
};

//Here is formatted feed object(JSON)
const formattedFeedItems = feedItems.map((item) => ({
 id: item.id,
  caption: item.caption,
  imgUrl: item.imgUrl,
  likeCount: item.likes,
  commentsCount: item.comments,
  follow: String, // Should showing follow-status (isFollow or unFollow)
  createAt: item.createdAt,
  author: {
    id: item.author.id,
    avatar: item.author.avatarUrl,
    firstName: item.author.firstName,
    lastName: item.author.lastName,
    relativeDate: timeDifference(new Date(), new Date(item.createdAt)),
    }
    }));

//
    const posts = formattedFeedItems

    this.server.emit('GetPosts', posts)
    
    return {
      posts
        }
    }

}
