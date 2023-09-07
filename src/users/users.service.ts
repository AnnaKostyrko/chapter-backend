import {
  ConflictException,
  // HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      relations: { subscribers: true },
    });
  }

  update(id: User['id'], payload: DeepPartial<User>): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async softDelete(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async toggleSubscription(
    currentUserId: number,
    targetUserId: number,
  ): Promise<User> {
    const targetUser = await this.findOne({ id: targetUserId });
    const currentUser = await this.findOne({ id: currentUserId });

    if (!targetUser || !currentUser) {
      throw new NotFoundException({
        error: 'User not found',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    if (currentUserId === targetUserId) {
      throw new ConflictException({
        error: 'You cannot subscribe to yourself!',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const isSubscribed = currentUser.subscribers.some(
      (subscriber) => subscriber.id === targetUserId,
    );

    currentUser.subscribers = isSubscribed
      ? currentUser.subscribers.filter(
          (subscriber) => subscriber.id !== targetUserId,
        )
      : [...currentUser.subscribers, targetUser];

    await currentUser.save();

    return currentUser;
  }
}
