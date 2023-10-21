import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { FeedService } from '../feed.service';


@WebSocketGateway({cors:'*'})
export class FeedGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly FeedService:FeedService){}


  @SubscribeMessage('connected')
    handleConnect(client:any){
      client.on("connection", (socket) => {
        console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    });
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: any) {
    client.on("disconnect", (socket) => {
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });
  }

   getUserID(){

   }
   
   getFeed(){
    return this.FeedService.getFeed()
   }

  }
