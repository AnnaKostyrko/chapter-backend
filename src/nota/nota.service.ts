import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Nota } from './entities/nota.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NotaService {
  constructor(
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(payload: Record<string, any>, user: User) {
    const newNota = new Nota(payload);
    newNota.user = user;
    console.log('newNota', newNota);
    return await this.notaRepository.save(newNota);
  }

  async findAll(userId: number) {
    return await this.notaRepository.find({ where: { user: { id: userId } } });
  }

  findOne(id: number) {
    return `This action returns a #${id} nota`;
  }

  remove(id: number) {
    return `This action removes a #${id} nota`;
  }
}
