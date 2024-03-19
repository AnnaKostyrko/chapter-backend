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
  Request,
  Query,
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
import { Server } from 'socket.io';
import { DeepPartial } from 'typeorm';

// import { FeedGateway } from 'src/feed/gateway/feet.gateway';

@ApiBearerAuth()
@ApiTags('posts')
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'posts',
  version: '1',
})
export class PostController {
  constructor(
    private readonly postService: PostService,
    // private readonly Gateway: FeedGateway,
    private readonly server: Server,
  ) {}

  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, description: 'Created.' })
  @Post('create')
  async createPost(@Req() req: any, @Body() createPostDto: PostDto) {
    const currentUser: User = req.user;
    return this.postService.create(currentUser, createPostDto);
    // .then((post) => {
    //   this.Gateway.server.emit('message', post);
    // });
  }

  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 201, description: 'Updated.' })
  @Patch('update/:id')
  async updatePost(
    @Req() req: any,
    @Param('id') postId: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<any> {
    return await this.postService.updatePost(
      req.user.id,
      postId,
      updatePostDto,
    );
  }

  @ApiOperation({ summary: 'delete a post' })
  @ApiResponse({ status: 201, description: 'delete.' })
  @Delete('delete/:id')
  async deletePost(
    @Req() req: any,
    @Param('id') postId: number,
  ): Promise<void> {
    return await this.postService.deletePost(req.user.id, postId);
  }

  @ApiOperation({ summary: 'Get posts by author' })
  @ApiResponse({ status: 200, description: 'OK', type: [PostEntity] })
  @Get('by-author')
  @UseGuards(AuthGuard('jwt'))
  async getPostsByAuthor(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ): Promise<DeepPartial<PostEntity[]>> {
    return await this.postService.getPostsByAuthor(req.user.id, page, limit);
  }

  @ApiOperation({ summary: 'Get user`s posts' })
  @ApiResponse({ status: 200, description: 'OK', type: [PostEntity] })
  @Get('by-user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getUsersPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Param('userId') userId: number,
  ): Promise<DeepPartial<PostEntity[]>> {
    return await this.postService.getUsersPosts(userId, page, limit);
  }

  @ApiOperation({ summary: 'get users who liked post' })
  @Get('users-who-liked-post/:id')
  @UseGuards(AuthGuard('jwt'))
  async getUsersWhoLikedPost(
    @Request() req: any,
    @Param('id') postId: number,
  ): Promise<DeepPartial<User[]>> {
    return await this.postService.getUsersWhoLikedPost(req.user.id, postId);
  }

  @ApiOperation({ summary: 'get posts of user that he liked or comment' })
  @Get('posts')
  @UseGuards(AuthGuard('jwt'))
  async getLikedAndComentedPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ) {
    const returnValue = this.postService.getLikedAndComentedPosts(
      req.user.id,
      page,
      limit,
    );
    return returnValue;
  }
  @ApiOperation({ summary: 'get post' })
  @Get('post/:id')
  @UseGuards(AuthGuard('jwt'))
  async getPost(@Param('id') postId: number, @Request() req: any) {
    return this.postService.getPostById(postId, req.user.id);
  }
}
