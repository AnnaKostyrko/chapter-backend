import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { NullableType } from '../utils/types/nullable.type';
import { BookInfoDto } from './dto/book-info.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  create(createProfileDto: CreateUserDto): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create(createProfileDto),
    );
  }

  findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<User[]> {
    return this.usersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(fields: EntityCondition<User>): Promise<NullableType<User>> {
    return this.usersRepository.findOne({
      where: fields,
    });
  }

  async update(
    userId: number,
    updateProfileDto: DeepPartial<User>,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (userId !== user.id) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'You do not have permission to update this user.',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    user.firstName = updateProfileDto.firstName ?? user.firstName;
    user.lastName = updateProfileDto.lastName ?? user.lastName;
    user.nickName = updateProfileDto.nickName ?? user.nickName;
    user.location = updateProfileDto.location ?? user.location;
    user.avatarUrl = updateProfileDto.avatarUrl ?? user.avatarUrl;
    user.userStatus = updateProfileDto.userStatus ?? user.userStatus;

    return this.usersRepository.save(user);
  }

  async softDelete(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async getBookInfoByUser(id: number, bookId: number): Promise<BookInfoDto> {
    const book = await this.bookRepository.findOne({
      where: { id: bookId, user: { id: id } },
      relations: ['status'],
    });

    if (!book) {
      throw new Error('Book not found for the given user');
    }

    return {
      author: book.author,
      annotation: book.annotation,
      statusName: book.status.name,
    };
  }
}
