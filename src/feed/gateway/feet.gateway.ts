import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: 'https://obscure-island-84086-0710166a71eb.herokuapp.com/api/v1/feed',
    methods:  ['GET', 'POST'],  
  },
  transports: ['websocket'],
})

export class FeedGateway {
  @WebSocketServer()
  server: any;

  @SubscribeMessage('message')
  handleMessage(client: any, message: { data: string }): void {
    console.log(`message: ${message.data}`);
    this.server.emit('message', message);
  }
  @SubscribeMessage('updateLikeCount')
  handleUpdateLikeCount(
    client: any,
    payload: { postId: number; likeCount: number },
  ): void {
    this.server.emit('likeCountUpdated', payload);
  }
}
