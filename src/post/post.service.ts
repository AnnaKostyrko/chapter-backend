import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { PostDto } from './dto/post.dto';
import { User } from '../users/entities/user.entity';
import { UpdatePostDto } from './dto/updatePost.dto';
import { createResponse } from 'src/helpers/response-helpers';
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

  async updatePost(
     postId:number,
     updatePostDto: UpdatePostDto
      ): Promise<void> {

    const post = await this.postRepository.findOne( {where: { id: postId}})
    
    if (!post) { 
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
 
    post.caption = updatePostDto.caption;

     await this.postRepository.save(post);
  }
  
  async deletePost(postId: number): Promise<void> {
    const post = await this.postRepository.findOne({where: { id: postId}});
  
    if (!post) {
      throw createResponse(HttpStatus.NOT_FOUND, 'Post not found.');
    }
  
     await this.postRepository.remove(post);
  }
  
  async getPostsByAuthor(author: User): Promise<PostEntity[]> {
    return await this.postRepository.find({
      where: { author: author.posts },
      order: { createdAt: 'DESC' },
    });
  }
}
