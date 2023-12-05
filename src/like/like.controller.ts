import { Controller, Param, Post, Request, UseGuards } from '@nestjs/common';

import { LikeService } from './like.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Likes')
@Controller({
  path: 'likes',
  version: '1',
})
export class LikeController {
  constructor(private readonly likeServise: LikeService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('like-unlike-post/:id')
  async togglePostLike(@Param('id') postId: number, @Request() request) {
    return await this.likeServise.togglePostLike(postId, request.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('like-unlike-comment/:id')
  async toggleCommentLike(@Param('id') commentId: number, @Request() request) {
    return await this.likeServise.toggleCommentLike(commentId, request.user.id);
  }
}
