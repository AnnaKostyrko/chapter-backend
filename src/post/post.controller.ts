import { Controller, Post, Body } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostDto } from './dto/post.dto';
import { PostEntity } from './entities/post.entity';

@ApiTags('posts')
@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, description: 'Created.', type: PostEntity })
  @Post()
  create(@Body() createPostDto: PostDto) {
    return this.postService.create(createPostDto);
  }
}
