import { CommentEntity } from './entity/comment.entity';

export interface CommentResponse {
  comments: CommentEntity[];
  totalComments: number;
}
