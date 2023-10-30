import {
  Body,
  Controller,
  DefaultValuePipe,
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  async getCommentsByPost(
    @Param('postId') postId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<CommentResponse> {
    return await this.commentService.getCommentsByPost(postId, page, limit);
  }
}
