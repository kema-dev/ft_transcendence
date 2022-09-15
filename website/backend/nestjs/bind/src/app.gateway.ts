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
import { NewPrivMsgDto } from './chat/dto/NewPrivMsgDto';
import { MatchService } from './match/match.service';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class AppGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;
	game: Game;
	private logger: Logger = new Logger('AppGateway');

	constructor(
		private readonly chatService: ChatService,
		private readonly userService: UsersService,
		private readonly matchService: MatchService,
	) {}

	// =========================== GENERAL ==================================

	// Connection
	handleConnection(client: Socket) {
		console.log(`Client connected : ${client.id}`);
	}
	// Disconnection
	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		if (this.game) this.game.stop();
		delete this.game;
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
	async newRoom(client: Socket, payload: any): Promise<void> {
		// this.gameService.games.push(
		// var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
		// );
		if (this.game) {
			this.game.stop();
			delete this.game;
		}
		const match_db = await this.matchService.create_match({
			nbrPlayer: payload.nbrPlayer,
			nbrBall: payload.nbrBall,
			players: payload.players,
			start: false,
			lobby_name: payload.lobby_name,
			open: true,
			owner: payload.owner,
		});
		this.game = new Game(
			match_db.nbrPlayer,
			match_db.nbrBall,
			this.server,
			match_db.players,
			payload.lobby_name,
		);
	}
	@SubscribeMessage('start')
	start(client: Socket, payload: any): void {
		// this.gameService.games.push(
		// var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
		// );
		if (this.game) {
			console.log('Game: Starting');
			this.matchService.start_match(payload.lobby_name);
			console.log(payload);
			this.game.start = true;
		}
	}
	afterInit(server: Server) {
		this.logger.log('Init');
	}

	// ============================ CHAT =====================================

	@SubscribeMessage('message')
	handleMessage(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) {
		console.log(`Client message : ${data}`);
		this.server.emit('message', client.id, data);
	}

	@SubscribeMessage('getMsgs')
	async getMsgs(@ConnectedSocket() client: Socket) {
		this.chatService.getMessages().then((res) => {
			console.log(res);
			client.emit('getMsgs', res);
		});
	}

	@SubscribeMessage('getPrivConvs')
	async getPrivConvs(@ConnectedSocket() client: Socket) {
		this.chatService.getPrivConvs().then((res) => {
			console.log(res);
			client.emit('getMsgs', res);
		});
	}

	@SubscribeMessage('newPrivMsg')
	async NewPrivMsg(
		@MessageBody() data: NewPrivMsgDto,
		@ConnectedSocket() client: Socket,
	) {
		await this.chatService.addPrivMsg(data);
		// await this.getMsgs(client);
	}

	@SubscribeMessage('getUsersByLoginFiltred')
	async getUserFiltred(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) {
		const users = await this.userService.getByLoginFiltred(data);
		const basicInfos: { login: string }[] = [];
		for (let i = 0; i < users.length; i++) {
			basicInfos.push({ login: users[i].login });
		}
		console.log(basicInfos);
		client.emit('getUsersByLoginFiltred', basicInfos);
	}

	@SubscribeMessage('lobby_list')
	async getLobbyList(@ConnectedSocket() client: Socket) {
		const lobby_list = await this.matchService.get_lobby_list();
		client.emit('lobby_list', lobby_list);
	}

	@SubscribeMessage('join_lobby')
	async joinLobby(
		@MessageBody() data: { username: string; lobby: string },
		@ConnectedSocket() client: Socket,
	) {
		const lobby = await this.matchService.join_lobby(data.username, data.lobby);
		client.emit('join_lobby', lobby);
	}
}
