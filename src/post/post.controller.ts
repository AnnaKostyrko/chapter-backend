import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
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
import { Request } from 'express';

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

  @ApiOperation({ summary: 'Get posts by author' })
  @ApiResponse({ status: 200, description: 'OK', type: [PostEntity] })
  @Get('by-author')
  @UseGuards(AuthGuard('jwt'))
  async getPostsByAuthor(@Req() req: Request): Promise<PostEntity[]> {
    const currentUser: User = req.user as User;
    console.log(currentUser);
    return await this.postService.getPostsByAuthor(currentUser);
  }
}
