import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    // Знайдемо користувача за його ідентифікатором
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    if (updateProfileDto.firstName) {
      user.firstName = updateProfileDto.firstName;
    }

    if (updateProfileDto.lastName) {
      user.lastName = updateProfileDto.lastName;
    }

    if (updateProfileDto.nickName) {
      user.nickName = updateProfileDto.nickName;
    }

    if (updateProfileDto.location) {
      user.location = updateProfileDto.location;
    }

    if (updateProfileDto.avatarUrl) {
      user.avatarUrl = updateProfileDto.avatarUrl;
    }
    if (updateProfileDto.userStatus) {
      user.userStatus = updateProfileDto.userStatus;
    }

    return this.usersRepository.save(user);
  }

  async softDelete(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
