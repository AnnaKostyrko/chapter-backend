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
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return await this.commentService.delete(id);
  }
}
