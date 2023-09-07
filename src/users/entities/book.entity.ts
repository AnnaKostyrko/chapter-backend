import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BookStatus } from './book-status.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nameOfBook: string;

  @Column()
  author: string;

  @Column()
  annotation: string;

  @Column()
  book_statusId: number;

  @ManyToOne(() => User, (user) => user.books)
  user: User;

  @ManyToOne(() => BookStatus, (status) => status.books)
  @JoinColumn({ name: 'book_statusId' })
  status: BookStatus;
}
