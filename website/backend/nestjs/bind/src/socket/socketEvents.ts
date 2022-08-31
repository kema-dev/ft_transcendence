import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { ChatService } from "../chat/chat.service";
import { Server, Socket } from 'socket.io';
import { NewPrivMsg } from "../chat/dto/NewPrivMsg";
import { UsersService } from "../users/users.service";
import { Body } from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: '*'
  }
}
)
export class SocketEvents {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UsersService,
    ) {}

  @WebSocketServer()
  server: Server;

  // Connexion
  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`, )
  }
  
  // Deconnexion
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected : ${client.id}`, )
  }
  
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data:string, @ConnectedSocket() client: Socket) {
    console.log(`Client message : ${data}`, )
    this.server.emit('message', client.id, data);
  }

  @SubscribeMessage("getMsgs")
  getMsgs(client: Socket)  {
    this.chatService.getMessages().then(res => {
      console.log(res);
      client.emit("getMsgs", res);
    })
  }
  
  @SubscribeMessage('newPrivMsg')
  NewPrivMsg(@MessageBody() data: NewPrivMsg, client : Socket) {
    this.chatService.addMessage(data);
    // this.getMsgs(client);
    // this.test(client);
    // this.chatService.getMessages().then(res => {
    //   console.log(res);
    //   console.log(client);
    //   client.emit("getMsgs", res);
    // })
  }

  @SubscribeMessage("getUsersByLoginFiltred")
  async getUserFiltred(@MessageBody() data : string, @ConnectedSocket() client: Socket) {
    const users = await this.userService.getByLoginFiltred(data);
    let basicInfos : { login: string }[] = [];
    for(let i = 0; i < users.length; i++) {
      basicInfos.push({login: users[i].login});
    }
    console.log(basicInfos);
    client.emit("getUsersByLoginFiltred", basicInfos);
  }
}