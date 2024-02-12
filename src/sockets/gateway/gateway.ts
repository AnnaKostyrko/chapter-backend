import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
})
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  clients: Map<number, Socket> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      const token = socket.handshake.headers.authorization;

      const secret = this.configService.getOrThrow('auth.secret', {
        infer: true,
      });

      if (token) {
        try {
          const decodedToken = this.jwtService.verify(token, { secret });

          const userId = decodedToken.id;
          this.clients.set(userId, socket);
        } catch (error) {
          this.server.emit('error', { message: error.message });
          socket.disconnect(true);
        }
      }
    });
  }

  sendNotificationToUser(
    currentUserId: number,
    targetUserId: number,
    notificationMessage: string,
  ) {
    const targetSocket = this.clients.get(targetUserId);
    const currentUser = this.clients.get(currentUserId);

    if (!currentUser) {
      throw new NotFoundException(
        `Сокет для користувача з id:${currentUserId} не знайдений`,
      );
    }

    if (targetSocket) {
      targetSocket.emit('subscribeNotification', notificationMessage);
    } else {
      throw new NotFoundException(
        `Сокет для користувача з id:${targetUserId} не знайдений`,
      );
    }
  }

  sendNotificationToAllUsers(
    currentUserId: number,
    notificationMessage: string,
  ) {
    this.clients.forEach((socket, userId) => {
      if (userId !== currentUserId) {
        socket.emit('postNotification', notificationMessage);
      }
    });
  }
}
