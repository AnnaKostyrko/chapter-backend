import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CommentEntity } from '../../comment/entity/comment.entity';
import { Like } from '../../like/entity/like.entity';
import { PostDto } from '../dto/post.dto';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: String, nullable: true })
  @ApiProperty()
  imgUrl: string | null;

  @Column({ type: String, nullable: true })
  @ApiProperty()
  caption: string | null;

  @Column({ type: String, nullable: true })
  @ApiProperty()
  title: string | null;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  constructor(payload?: PostDto) {
    if (!payload) return;
    this.imgUrl = payload.imgUrl || null;
    this.title = payload.title || null;
    this.caption = payload.caption || null;
  }
}
