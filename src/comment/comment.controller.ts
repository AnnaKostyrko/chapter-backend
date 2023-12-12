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
  CreateCommentDto,
  GetCommentsDto,
  UpdateCommentDto,
} from './dto/comment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommentResponse } from './interfaces';

@ApiTags('Comments')
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
    @Body() commentData: CreateCommentDto,
    @Request() req,
  ): Promise<CommentEntity> {
    return await this.commentService.create(commentData, postId, req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'edit a comment on a post ' })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    return await this.commentService.update(id, updateCommentDto);
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get comments for a post' })
  @Get('GetCommentByPost/:id')
  async GetComments(
    @Param('id') postId: number,
    @Query() commentData: GetCommentsDto,
  ) {
    return await this.commentService.GetComments(postId, commentData);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get comments for a post' })
  @Get('GetCommentToComment/:id')
  async GetCommentToComment(
    @Param('parrentId') parrentId: number,
  ): Promise<CommentEntity[]> {
    return await this.commentService.getCommentToComment(parrentId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId')
  async deleteComment(@Param('commentId') id: number): Promise<void> {
    return await this.commentService.deleteComment(id);
  }
}
