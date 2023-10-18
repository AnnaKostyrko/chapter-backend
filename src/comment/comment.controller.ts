import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
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
    ): Promise<CommentEntity> {
        commentData.postId = postId;
        return await this.commentService.create(commentData);
    }
}
