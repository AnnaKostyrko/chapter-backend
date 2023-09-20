import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { PostDto } from './dto/post.dto';
import { User } from '../users/entities/user.entity';
import { UpdatePostDto } from './dto/updatePost.dto';
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

  async update(postId:number,author: User, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    
    const post = await this.postRepository.findOne( {where: { id: postId}})

    if (!post) {
      throw new Error(`Post with ID ${postId} not found`);
    }
    
    post.caption = updatePostDto.caption;

    return await this.postRepository.save(post);
  }
 
}
