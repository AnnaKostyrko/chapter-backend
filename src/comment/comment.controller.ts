import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentEntity } from './entity/comment.entity';
import {
  CommentToCommentDto,
  PostCommentDto,
  UpdateCommentDto,
} from './dto/comment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PostEntity } from 'src/post/entities/post.entity';
import { DeepPartial } from 'typeorm';

@ApiTags('Comment')
@ApiBearerAuth()
@Controller({
  path: 'comments',
  version: '1',
})
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':postId')
  @ApiOperation({ summary: 'make a comment on a post ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create comment to post',
    content: {
      'application/json': {
        example: {
          text: 'Great post!',
          postId: 2,
          userId: 5,
          post: {},
          user: {},
          parentId: null,
          id: 74,
          createdAt: 'created date',
          updatedAt: 'updated date',
        },
      },
    },
  })
  async create(
    @Param('postId') postId: number,
    @Body() commentData: PostCommentDto,
    @Request() req,
  ): Promise<DeepPartial<PostEntity>> {
    return await this.commentService.create(commentData, postId, req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'edit a comment on a post ' })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    return await this.commentService.update(req.user.id, id, updateCommentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':commentId/to-comment')
  @ApiOperation({ summary: 'make a comment on a comment ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create comment to comment',
    content: {
      'application/json': {
        example: {
          parentId: 1,
          text: 'Great comment!',
          postId: 1,
          userId: 5,
          user: {},
          id: 73,
          createdAt: 'created date',
          updatedAt: 'updated date',
        },
      },
    },
  })
  async commentToComment(
    @Request() req,
    @Param('commentId') commentId: number,
    @Body() commentData: CommentToCommentDto,
  ): Promise<DeepPartial<PostEntity>> {
    return await this.commentService.commentToComment(
      req.user.id,
      commentId,
      commentData,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('comments/:postId')
  @ApiOperation({ summary: 'get comments of the post ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get post's comments",
    content: {
      'application/json': {
        example: {
          comments: [
            {
              id: 1,
              parentId: null,
              text: 'Great post!',
              postId: 1,
              userId: 1,
              createdAt: '2024-02-28T11:39:17.180Z',
              updatedAt: '2024-02-28T11:39:17.180Z',
              post: {
                id: 1,
                imgUrl:
                  'https://res.cloudinary.com/de2bdafop/image/upload/c_auto,g_auto/d_chapter:placeholders:post.webp/v1709127169/chapter/posts/4/LlNj4FLvgTOPCAflNxqLj.webp',
                caption: null,
                title: '1',
                createdAt: '2024-02-28T11:32:54.002Z',
                updatedAt: '2024-02-28T11:32:54.002Z',
              },
              __entity: 'CommentEntity',
            },
          ],
          totalComments: 7,
        },
      },
    },
  })
  async getCommentsByPost(
    @Param('postId') postId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.commentService.getCommentsByPost(postId, page, limit);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get replice for a comments' })
  @Get('commentToCommentId/:id')
  async getCommentToComment(
    @Param('id', ParseIntPipe)
    commentToCommentId: number,
  ) {
    return await this.commentService.getCommentToComment(commentToCommentId);
  }

  @ApiOperation({ summary: 'delete a comment' })
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 201, description: 'delete.' })
  @Delete('delete/:id')
  async deletePost(
    @Param('id') commentId: number,
    @Request() req,
  ): Promise<DeepPartial<PostEntity>> {
    return await this.commentService.deleteComment(commentId, req.user.id);
  }
}
