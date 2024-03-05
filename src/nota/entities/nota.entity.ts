import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';

@Entity()
export class Nota {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  data: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.nota, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  constructor(payload?: Record<string, any>) {
    if (!payload) return;
    this.data = payload;
  }
}
