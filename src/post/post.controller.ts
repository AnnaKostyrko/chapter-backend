import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PostService } from './post.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostDto } from './dto/post.dto';
import { AuthGuard } from '@nestjs/passport';
import { PostEntity } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
@ApiBearerAuth()
@ApiTags('posts')
@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, description: 'Created.' })
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createPost(
    @Req() req: any,
    @Body() createPostDto: PostDto,
  ): Promise<PostEntity> {
    const currentUser: User = req.user;

    return await this.postService.create(currentUser, createPostDto);
  }
}
