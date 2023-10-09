import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './entity/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async deleteComment(commentId: number): Promise<void> {
    const result = await this.commentRepository.delete(commentId);
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
  }
}
