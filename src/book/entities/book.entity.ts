import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BookStatus } from './book-status.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';
import { Exclude } from 'class-transformer';

@Entity()
export class Book extends EntityHelper {
  @ApiProperty({ example: '1', description: 'id for book' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Harry Potter' })
  @Column()
  nameOfBook: string;

  @ApiProperty({ example: 'J.K. Rowling' })
  @Column({ nullable: true })
  author: string;

  @ApiProperty({
    example:
      'Harry Potter is a series of fantasy novels by J. K. Rowling about a young wizard and his friends at Hogwarts School.',
  })
  @Column({ nullable: true })
  annotation: string;

  @ApiProperty({
    example: '1',
    description: 'id for book status',
  })
  @Column({ nullable: true })
  book_statusId: number;

  @Column({ default: false, nullable: false })
  favorite_book_status: boolean;

  @Column({ type: String, nullable: true })
  imagePath: string;

  @Exclude()
  @ManyToOne(() => User, (user) => user.books, { onDelete: 'CASCADE' })
  user: User;

  @Exclude()
  @ManyToOne(() => BookStatus, (status) => status.books, { cascade: true })
  @JoinColumn({ name: 'book_statusId' })
  status: BookStatus;
}
