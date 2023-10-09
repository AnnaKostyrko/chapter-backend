import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentEntity } from './entity/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async update(
    commentId: number,
    updateData: UpdateCommentDto,
  ): Promise<CommentEntity> {
    const existingComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    await this.commentRepository.update(commentId, updateData);
    const updatedComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!updatedComment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return updatedComment;
  }
}
