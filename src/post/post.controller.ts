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
  @UseGuards(AuthGuard('jwt'))
  async createPost(@Req() req: any, @Body() createPostDto: PostDto) {
    const currentUser: User = req.user;
    return this.postService.create(currentUser, createPostDto);
    // .then((post) => {
    //   this.Gateway.server.emit('message', post);
    // });
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
    // .then((caption) => {
    //   console.log(caption);
    //   this.Gateway.server.emit('UpdatePost', caption);
    // });
    // return await this.postService.updatePost(postId, updatePostDto);
    // .then((caption) => {
    //   console.log(caption);
    //   this.Gateway.server.emit('UpdatePost', caption);
    // });
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
  async getPostsByAuthor(@Request() req: any): Promise<PostEntity[]> {
    return await this.postService.getPostsByAuthor(req.user.id);
  }

  @ApiOperation({ summary: 'Get user`s posts' })
  @ApiResponse({ status: 200, description: 'OK', type: [PostEntity] })
  @Get('by-user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getUsersPosts(@Param('userId') userId: number): Promise<PostEntity[]> {
    return await this.postService.getUsersPosts(userId);
  }

  @ApiOperation({ summary: 'get users who liked post' })
  @Post('users-who-liked-post/:id')
  @UseGuards(AuthGuard('jwt'))
  async getUsersWhoLikedPost(@Param('id') postId: number): Promise<object> {
    return await this.postService.getUsersWhoLikedPost(postId);
  }

  @ApiOperation({ summary: 'get posts of user that he liked or comment' })
  @Get('posts')
  @UseGuards(AuthGuard('jwt'))
  async getLikedAndComentedPosts(@Req() req) {
    const user: User = req.user as User;
    const returnValue = this.postService.getLikedAndComentedPosts(user.id);
    return returnValue;
  }
}
