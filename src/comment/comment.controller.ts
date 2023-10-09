import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: number): Promise<void> {
    return this.commentService.deleteComment(commentId);
  }
}
