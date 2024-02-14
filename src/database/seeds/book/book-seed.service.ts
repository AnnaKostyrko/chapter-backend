import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from 'src/book/entities/book.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BookSeedService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async seedBooksForUser(user: User, count: number) {
    for (let i = 1; i <= count; i++) {
      const book = this.bookRepository.create({
        nameOfBook: `Book${i}_User${user.id}`,
        author: `Author${i}`,
        annotation: `Annotation for Book${i}`,
        user: user,
      });

      await this.bookRepository.save(book);
    }
  }
}
