import { Controller, Post, Body } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({ summary: 'Create a post' })
  @ApiBody({ type: Post })
  create(@Body() data: any) {
    return this.postService.create(data);
  }
}
