import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { PostDto } from './dto/post.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async create(author: User, createPostDto: PostDto) {
    const user = author;
    const post = new PostEntity();

    post.imgUrl = createPostDto.imageUrl;
    post.author = user;
    post.caption = createPostDto.caption;

    return await this.postRepository.save(post);
  }

  async getPostsByAuthor(author: User): Promise<PostEntity[]> {
    return await this.postRepository.find({ where: { author: author.posts } });
  }
}
