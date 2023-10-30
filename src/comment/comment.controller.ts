import {
  Body,
  Controller,
  DefaultValuePipe,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/comment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommentResponse } from './interfaces';

@ApiTags('Comment')
@ApiBearerAuth()
@Controller('comment')
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
    @Body() commentData: CreateCommentDto,
    @Request() req,
  ): Promise<CommentEntity> {
    return await this.commentService.create(commentData, postId, req.user.id);
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
    @Body() commentData: CreateCommentDto,
  ): Promise<CommentEntity> {
    return await this.commentService.commentToComment(
      req.user.id,
      commentId,
      commentData,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('comments/:postId')
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
              parentId: 1,
              text: 'Great post!',
              postId: 1,
              userId: 3,
              createdAt: '2023-10-18T08:58:10.879Z',
              updatedAt: '2023-10-18T08:58:10.879Z',
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
  ): Promise<CommentResponse> {
    return await this.commentService.getCommentsByPost(postId, page, limit);
  }
}
