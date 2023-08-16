import { Controller, Post, Body } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() data: any) {
    return this.postService.create(data);
  }
}
