import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PostEntity } from 'src/post/entities/post.entity';

@Injectable()
export class PostSeedService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}

  async seedPostsForUser(user: User, count: number): Promise<PostEntity[]> {
    const posts: PostEntity[] = [];

    for (let i = 1; i <= count; i++) {
      const newPost = this.postRepository.create({
        imgUrl: `PostImgUrl${i}`,
        caption: `PostCaption${i}`,
        title: `PostTitle${i}`,
        author: user,
      });

      const savedPost = await this.postRepository.save(newPost);
      posts.push(savedPost);
    }

    return posts;
  }
}
