import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EventsGateway])
  ],
  providers: [EventsGateway,
    {
      provide: 'ConnectedUsersMap', 
      useValue: new Map<string, string>(),
    },
  ],
})
export class EventsModule {}
