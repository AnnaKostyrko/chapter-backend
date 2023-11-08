import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto, GetCommentsDto } from './dto/comment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':postId')
  async create(
    @Param('postId') postId: number,
    @Body() commentData: CreateCommentDto,
    @Request() req,
  ): Promise<CommentEntity> {
    return await this.commentService.create(commentData, postId, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':commentId/to-comment')
  async commentToComment(
    @Request() req,
    @Param('commentId') commentId: number,
    @Body() commentData: CreateCommentDto,
  ) {
    return await this.commentService.commentToComment(
      req.user.id,
      commentId,
      commentData,
    );
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
}
