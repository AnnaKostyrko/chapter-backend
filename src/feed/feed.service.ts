import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PostEntity } from "src/post/entities/post.entity";
import { relative } from "path";

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(PostEntity)
        private readonly postRepository: Repository<PostEntity>,
      ) {}
    
      async getFeed() {
        const feedItems = await this.postRepository.find({
            order: { createdAt: 'DESC' },
            relations: {
                author: true,
            },
        });
    
        const formattedFeedItems = feedItems.map((item) => ({
            id: item.id,
            caption: item.caption,
            imgUrl: item.imgUrl,
            likeCount: Number,
            commentsCount: Number,
            createAt: item.createdAt,
            author: {
                id: item.author.id,
                avatar: item.author.avatarUrl,
                firstName: item.author.firstName,
                lastName: item.author.lastName,
            }
        }));
    console.log(formattedFeedItems)
        return {
            feedItems: formattedFeedItems,
        };
    }
    
}


