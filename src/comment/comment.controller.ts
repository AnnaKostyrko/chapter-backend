import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  @Post('to-comment/:commentId')
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
}
