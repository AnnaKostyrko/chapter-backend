import { Body, Controller, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(@Body() commentData: CreateCommentDto): Promise<CommentEntity> {
    return await this.commentService.create(commentData);
  }
}
