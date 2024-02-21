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
import { PostEntity } from '../../post/entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { EntityHelper } from '../../utils/entity-helper';
import { Like } from '../../like/entity/like.entity';

@Entity()
export class CommentEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ nullable: true })
  @ApiProperty()
  parentId: number;

  @Column()
  @ApiProperty()
  text: string;

  @Column({ nullable: true })
  @ApiProperty()
  recipientId: number;

  @Column({ nullable: true })
  @ApiProperty()
  recipientNickName: string;

  @ManyToOne(() => PostEntity, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @Column()
  @ApiProperty()
  postId: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @ApiProperty()
  userId: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];
}
