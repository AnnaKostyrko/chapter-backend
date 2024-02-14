import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';

@Entity()
export class BookStatus extends EntityHelper {
  @ApiProperty({ example: '1', description: 'status id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Read', description: 'Name of the book status' })
  @Column()
  name: string;

  @ApiProperty({
    type: () => [Book],
    description: 'Books associated with this status',
  })
  @OneToMany(() => Book, (book) => book.status)
  books: Book[];
}
