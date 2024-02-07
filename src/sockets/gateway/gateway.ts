import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
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
          console.log(Array.from(this.clients.keys()));
        } catch (error) {
          console.log('error', error);
          this.server.emit('error', { message: error.message });
          socket.disconnect(true);
        }
      }
    });
  }

  sendNotificationToUser(currentUserId: number, targetUserId: number) {
    const targetSocket = this.clients.get(targetUserId);
    // console.log('targetSocket', targetSocket);
    if (targetSocket) {
      targetSocket.emit(
        'notification',
        `На вас підписався юзер з id:${currentUserId}`,
      );
    } else {
      console.log(`Сокет для користувача з id:${targetUserId} не знайдений`);
    }
    // console.log(
    //   `a user with id:${currentUserId} has subscribed to you(${targetUserId})`,
    // );
  }

  @SubscribeMessage('newMessage')
  onMessage(@MessageBody() body: any) {
    console.log('body', body);
  }
}
