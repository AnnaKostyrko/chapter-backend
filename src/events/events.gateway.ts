import { InjectRepository } from '@nestjs/typeorm';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Server } from 'http';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@WebSocketGateway({namespace:"feed"})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(User)
    // private usersService: UsersService,
    private readonly connectedUsers = new Map<string, string>()
  ) {}
  @WebSocketServer() 
  server: Server;
  socket: Socket;

  afterInit(server: Server) {
    console.log('Socket initialized');
  }


   handleConnection(client: any, ...args: any[]) {
  console.log('Client connected:', client.id);

    client.on('SetSocketId',(userId: string)=>{
      this.connectedUsers.set(client.id, userId)
    })
  
  }
  getUserId(socketId: string){
    this.connectedUsers.get(socketId)
  }
 // посмотреть что тут есть юзер и добавить id юзера из базы 
              // создать список всех активных юзеров
  
  use(socket, next ){
    socket 
  }

  

     // получаем объект пост, кто(id) и кто принял(id)
    // user1 to user2
    // сохранить пост в базу 
    // emit new events ( новый пост пришел message и юзер который принял)
    eventPost( post: any ){
      
    }
    //сделать заголушку для фронта 


    
    //like count 

    //comment count 

   
 // для каждых событий разный event
  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
    if (typeof client.id === 'string') {
        this.connectedUsers.delete(client.id);
      }
    } 
  }
  // when we clicked on like to us output user list with status follow  
    // our return users array contains the following values [urlImg, FullName and following status]
    // create endpoint for like 
  
