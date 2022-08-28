import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import Vector from 'src/game2.0/objects/Vector';
import Game from 'src/game2.0/Game';
import { GameService } from 'src/game2.0/game.service';
import { BallDto } from 'src/game2.0/dto/BallDto';

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
    private gameService: GameService
  ) {
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: any): void {
    this.server.emit('msgToClient', payload);
    this.logger.log(`Message: ${payload}`);
  }
  @SubscribeMessage('getBallPos')
  getBallsPos(client: Socket, payload: any): any {
    this.server.emit('getBallPos', this.game.balls);
    this.logger.log(`Message: ${payload}`);
    return this.game.balls;
  }
  @SubscribeMessage('setMov')
  setMov(client: Socket, payload: any): void {
    this.game.setMov(payload);
  }
  @SubscribeMessage('newRoom')
  newRoom(client: Socket, payload: any): void {
    // this.gameService.games.push(
    // var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
    // );
    this.game = new Game(4, 1, this.server);
  }
  afterInit(server: Server) {
    this.logger.log('Init');
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (this.game)
      this?.game.stop()
    delete this.game
  }

  handleConnection(client: Socket, ...args: any[]) {

    // this.logger.log(`Client connected: ${client.id}`);
  }
}
