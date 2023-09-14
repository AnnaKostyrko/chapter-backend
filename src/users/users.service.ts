import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { NullableType } from '../utils/types/nullable.type';
import { UpdateUserRegisterDto } from './dto/complete-register.dto';

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

// find
// find(UpdateUserRegister:UpdateUserRegisterDto):Promise<User>{
//   const users = await this.usersRepository.find({
//     skip,
//     take,
//     where: {
//         name: ILike(`%${ firstName || ''}%`)
//     },
//     order: sortingObject,
//     join: {
//         alias: 'user',
//         leftJoinAndSelect: {
//             country: 'user.country_id',
//         },
//     },
//   });
//   return this.userRepository
//       .createQueryBuilder('user')
//       .where('user.name LIKE :searchString OR user.email LIKE :searchString', {
//         searchString: %${searchString}%,
//       })
//       .getMany();
// }

//like - пошук подібного рядка 


  async findAllUsers(fields: EntityCondition<User>): Promise<User[]> {
    const users = await this.usersRepository.find({
      where: fields,
    });
    return users;
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
  
  
}
