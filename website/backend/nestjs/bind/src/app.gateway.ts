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
import UserDto from 'src/users/dto/user.dto';
import ResumUserDto from 'src/users/dto/ResumUserDto';

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
    private readonly chatService: ChatService,
    private readonly userService: UsersService,
  ) { }

  // =========================== GENERAL ==================================

  // Connection
  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`,)
  }
  // Disconnection
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (this.game)
      this.game.destructor()
    delete this.game
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

  // ============================ USER =====================================

  @SubscribeMessage('addFriend')
  addFriend(client: Socket, payload: any): void {
    this.logger.log('add friend')
    this.userService.sendFriendRequest(payload.sender, payload.receiver)
  }

  @SubscribeMessage('getByLoginFiltred')
  async getByLoginFiltred(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    this.logger.log('getByLoginFiltred: starting for ' + data.toString());
    const users = await this.userService.getByLoginFiltred(data);
    let UsersDto: ResumUserDto[] = [];
    for (let i = 0; i < users.length; i++) {
      UsersDto.push(new ResumUserDto(users[i]));
    }
    console.log(UsersDto);
    client.emit("getUsersByLoginFiltred", UsersDto);
  }


  // ============================ CHAT =====================================

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    console.log(`Client message : ${data}`,)
    this.server.emit('message', client.id, data);
  }

  @SubscribeMessage("getMsgs")
  async getMsgs(@ConnectedSocket() client: Socket) {
    this.chatService.getMessages().then(res => {
      console.log(res);
      client.emit("getMsgs", res);
    })
  }

  @SubscribeMessage("getPrivConvs")
  async getPrivConvs(@ConnectedSocket() client: Socket) {
    this.chatService.getPrivConvs().then(res => {
      console.log(res);
      client.emit("getMsgs", res);
    })
  }

  @SubscribeMessage('newPrivMsg')
  async NewPrivMsg(@MessageBody() data: NewPrivMsgDto, @ConnectedSocket() client: Socket) {
    await this.chatService.addPrivMsg(data);
    // await this.getMsgs(client);
  }

  @SubscribeMessage("getUsersByLoginFiltred")
  async getUserFiltred(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    const users = await this.userService.getByLoginFiltred(data);
    let basicInfos: { login: string }[] = [];
    for (let i = 0; i < users.length; i++) {
      basicInfos.push({ login: users[i].login });
    }
    console.log(basicInfos);
    client.emit("getUsersByLoginFiltred", basicInfos);
  }
}
