import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
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
import { UpdatePostDto } from './dto/updatePost.dto';
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

  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 201, description: 'Updated.' })
  @Patch('update/:id')
  async updatePost(
    @Param('id') postId: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<void> {
    await this.postService.updatePost(postId, updatePostDto);
  }

  @ApiOperation({ summary: 'delete a post' })
  @ApiResponse({ status: 201, description: 'delete.' })
  @Delete('delete/:id')
  async deletePost(@Param('id') postId: number): Promise<void> {
    return await this.postService.deletePost(postId);
  }

  @ApiOperation({ summary: 'Get posts by author' })
  @ApiResponse({ status: 200, description: 'OK', type: [PostEntity] })
  @Get('by-author')
  @UseGuards(AuthGuard('jwt'))
  async getPostsByAuthor(@Req() req): Promise<PostEntity[]> {
    const currentUser: User = req.user as User;

    return await this.postService.getPostsByAuthor(currentUser);
  }

  @ApiOperation({ summary: 'get users who liked post' })
  @Post('users-who-liked-post/:id')
  @UseGuards(AuthGuard('jwt'))
  async getUsersWhoLikedPost(@Param('id') postId: number): Promise<object> {
    return await this.postService.getUsersWhoLikedPost(postId);
  }
}
