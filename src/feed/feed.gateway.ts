import { InjectRepository } from '@nestjs/typeorm';
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PostEntity } from 'src/post/entities/post.entity';
import { Repository } from 'typeorm';

@WebSocketGateway()
export class FeedGateway {
  @WebSocketServer() server: Server;
  constructor(  
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    private readonly socket: Socket,
  ) {}
// The limit outputing of posts equal three
      async addFeedPost(newItem){
        const post = await this.postRepository.save(newItem)
        //we inform a new users about new post
        
  
        this.socket.emit("newPost", post)
        return post
    }
}