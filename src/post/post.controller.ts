import { Controller, Post, Body } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostDto } from './dto/post.dto';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({ summary: 'Create a post' })
  @ApiBody({ type: PostDto })
  create(@Body() data: any) {
    return this.postService.create(data);
  }
}
