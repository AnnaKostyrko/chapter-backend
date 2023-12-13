import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody
} from '@nestjs/websockets';

@WebSocketGateway(1127, {
  namespace: 'feed',
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  },
})
export class FeedGateway {
  @WebSocketServer()
  server: any;

  @SubscribeMessage('message')
  handleMessage(client: any, message: { data: string }): void {
    console.log(`message: ${message.data}`);
    this.server.emit('message', message);
  }

}
