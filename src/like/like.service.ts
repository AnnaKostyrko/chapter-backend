import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entity/like.entity';
import { Repository } from 'typeorm';
import { createResponse } from 'src/helpers/response-helpers';
import { PostEntity } from 'src/post/entities/post.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like) private likeRepository: Repository<Like>,
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}

  async getLikedUsers(postId: number) {
    const likes = await this.likeRepository.find({
      where: { postId },
      relations: ['user'],
    });

    return likes.map((like) => like.user.id);
  }

  async togglePostLike(postId: number, userId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw createResponse(HttpStatus.NOT_FOUND, 'Post not found.');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      return await this.getLikedUsers(postId);
    } else {
      const like = new Like();
      like.postId = postId;
      like.userId = userId;
      await this.likeRepository.save(like);
      return await this.getLikedUsers(postId);
    }
  }
}
