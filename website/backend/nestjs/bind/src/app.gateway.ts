import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import Vector from './game2.0/objects/Vector';
import Game from './game2.0/Game';
import { ChatService } from './chat/chat.service';
import { UsersService } from './users/users.service';
import { BallDto } from './game2.0/dto/BallDto';
import { NewPrivMsgDto } from "./chat/dto/NewPrivMsgDto";

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  game: Game; 
  private logger: Logger = new Logger('AppGateway');
  
  constructor(
    private readonly chatService : ChatService,
    private readonly userService : UsersService,
    
    ) {}
    
    // =========================== GENERAL ==================================

    // Connection
    async handleConnection(@ConnectedSocket() client: Socket) {
      console.log(`Client connected : ${client.id}`);
      // console.log("query = ", client.handshake.query.login);
      let login = client.handshake.query.login as string;
      await this.userService.saveSocket(login, client.id);
      // handleConnection(@ConnectedSocket() client: Socket, login: string) {
      // console.log(`Client connected : ${client.id}, login = ${login}`);
    }
    // Disconnection
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
      // console.log("query = ", client.handshake.query.login);
      if (this.game)
        this.game.stop();
      delete this.game;
    }

    @SubscribeMessage('connection')
    saveSocket(@ConnectedSocket() client: Socket, ...args: any[]) {
      console.log("debut saveSocket");
    }


  // ============================ GAME =====================================
  
  @SubscribeMessage('getBallPos')
  getBallsPos(client: Socket, payload: any): any {
    this.server.emit('getBallPos', this.game.balls);
    this.logger.log(`Message: ${payload}`);
    return this.game.balls;
  }
  @SubscribeMessage('setMov')
  setMov(client: Socket, args: any): void {
    this.game.setMov(args.mov, args.login);
  }
  @SubscribeMessage('newRoom')
  newRoom(client: Socket, payload: any): void {
    // this.gameService.games.push(
    // var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
    // );
    if (!this.game)
      this.game = new Game(4, 3, this.server, ['tdayde', 'oc8', 'zeus', 'Jj']);
  }
  @SubscribeMessage('start')
  start(client: Socket, payload: any): void {
    // this.gameService.games.push(
    // var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
    // );
    if (this.game) {
      console.log("startback")
      this.game.start = true;
    }
  }
  afterInit(server: Server) {
    this.logger.log('Init');
  }
  
  
  // ============================ CHAT =====================================
  
  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() data:string, @ConnectedSocket() client: Socket) {
  //   console.log(`Client message : ${data}`, )
  //   this.server.emit('message', client.id, data);
  // }
  
  // @SubscribeMessage("getMsgs")
  // async getMsgs(@ConnectedSocket() client: Socket)  {
  //   this.chatService.getMessages().then(res => {
  //     console.log(res);
  //     client.emit("getMsgs", res);
  //   })
  // }

  // @SubscribeMessage("getPrivConvs")
  // async getPrivConvs(@ConnectedSocket() client: Socket)  {
  //   this.chatService.getPrivConvs().then(res => {
  //     console.log(res);
  //     client.emit("getMsgs", res);
  //   })
  // }

  @SubscribeMessage('newPrivMsg')
  async NewPrivMsg(@MessageBody() data: NewPrivMsgDto, @ConnectedSocket() client : Socket) {
    // console.log(`controller newPrivMsg:  userSend = ${data.userSend}, userReceive = ${data.userReceive}`)
    await this.chatService.addPrivMsg(data);
    const userSocketId = (await this.userService.getByLogin(data.userReceive)).socketId;
    // let socketSocket = this.server.sockets.sockets.get(userSocketId);
    // let socketSocket = this.server.sockets.sockets.get("ok");
    this.server.to(userSocketId).emit("newPrivMsg", data);
    // console.log(socketSocket);

    
    // await this.getMsgs(client);
  }

  @SubscribeMessage("getUsersByLoginFiltred")
  async getUserFiltred(@MessageBody() data : {filter: string, login: string} , @ConnectedSocket() client: Socket) {
    const users = await this.userService.getByLoginFiltred(data.filter);
    let basicInfos : { login: string }[] = [];
    for(let i = 0; i < users.length; i++) {
      if (data.login != users[i].login)
        basicInfos.push({login: users[i].login});
    }
    client.emit("getUsersByLoginFiltred", basicInfos);
  }
}
