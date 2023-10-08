import { Injectable } from '@nestjs/common';
import { CommentEntity } from './entity/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async create(commentData: CreateCommentDto): Promise<CommentEntity> {
    const comment = this.commentRepository.create(commentData);
    return await this.commentRepository.save(comment);
  }
}
