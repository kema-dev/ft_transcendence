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
import { PrivConvDto } from './chat/dto/PrivConvDto';
import { MessageDto } from './chat/dto/MessageDto';
import ProfileUserDto from 'src/users/dto/ProfileUserDto';
import ResumUserDto from 'src/users/dto/ResumUserDto';
import BasicUserDto from 'src/chat/dto/BasicUserDto';
import { UserEntity } from 'src/users/user.entity';
import { MatchDto } from 'src/match/match.dto';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class AppGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	games: Game[] = [];
	private logger: Logger = new Logger('AppGateway');

	constructor(
		private readonly chatService: ChatService,
		private readonly userService: UsersService,
	) { }

	// =========================== GENERAL ==================================

	// Connection
	async handleConnection(@ConnectedSocket() client: Socket) {
		console.log('query = ', client.handshake.query.login);
		let login = client.handshake.query.login as string;
		await this.userService.saveSocket(login, client.id);
		// handleConnection(@ConnectedSocket() client: Socket, login: string) {
		// console.log(`Client connected : ${client.id}, login = ${login}`);
	}
	// Disconnection
	async handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		// console.log("query = ", client.handshake.query.login);
		const user = await this.userService.getByLogin(
			client.handshake.query.login as string,
		);
		if (!user) return;
		let game = this.games.find((game) => game.lobby_name === user.lobby_name);
		if (!game) return;
		game.destructor();
		if (game.players.length - 1 > 0) {
			let newGame = new Game(
				game.nbrPlayer - 1,
				game.nbrBall,
				this.server,
				game.players.filter((player) => player.login !== user.login),
				game.lobby_name,
				game.owner,
				game.img,
			);
			this.games.push(newGame);
			this.server.to(newGame.sockets).emit('reload_game');
		}
		console.log('game destroyed');
		this.games.splice(this.games.indexOf(game), 1);
	}

	// ============================ GAME =====================================

	// @SubscribeMessage('getBallPos')
	// getBallsPos(client: Socket, payload: any): any {
	// 	this.server.emit('getBallPos', this.game[0].balls);
	// 	this.logger.log(`Message: ${payload}`);
	// 	return this.game[0].balls;
	// }
	@SubscribeMessage('setMov')
	setMov(client: Socket, args: any): void {
		console.log('setMov');
		console.log(args);
		let game = this.games.find((game) => game.lobby_name === args.lobby_name);
		if (game) game.setMov(args.mov, args.login);
	}
	@SubscribeMessage('newLobby')
	async newRoom(@MessageBody() data: { login: string, nbrBall: number },
		@ConnectedSocket() client: Socket): Promise<void> {
		let user = await this.userService.getByLogin(data.login);
		if (!user) return;
		let game = new Game(
			1,
			data.nbrBall,
			this.server,
			[user],
			user.login + "'s lobby",
			user.login,
			user.avatar
		);
		this.games.push(game);
		user.lobby_name = game.lobby_name;
		this.userService.saveUser(user);
		this.server.emit('lobbys', this.sendLobbys(this.games));
	}
	sendLobbys(games: Game[]) {
		let lobbys: MatchDto[] = [];
		games.forEach((game) => {
			lobbys.push(new MatchDto(game));
			console.log(game.img, lobbys[lobbys.length - 1].img);
		});
		return lobbys;
	}
	@SubscribeMessage('look_lobby')
	async lookLobby(@ConnectedSocket() client: Socket, @MessageBody() data: { login: string, lobby_name: string },) {
		const game = this.games.find((game) => game.lobby_name === data.lobby_name);
		if (!game) return;
		game.addViewer(client.id);
	}
	@SubscribeMessage('lobbys')
	async getLobbyList(@ConnectedSocket() client: Socket) {
		client.emit('lobbys', this.sendLobbys(this.games));
	}
	@SubscribeMessage('join_lobby')
	async joinLobby(
		@MessageBody() data: { login: string; lobby: string },
		@ConnectedSocket() client: Socket,
	) {
		const game = this.games.find((game) => game.lobby_name == data.lobby);
		if (!game) return;
		const user = await this.userService.getByLogin(data.login);
		if (!user) return;
		if (game.players.length >= 7) return;
		if (game.start) return;
		let newGame = new Game(
			game.nbrPlayer + 1,
			game.nbrBall,
			this.server,
			game.players.concat(user),
			game.lobby_name,
			game.owner,
			game.img
		);
		game.destructor();
		this.games.push(newGame);
		this.server.to(newGame.sockets).emit('reload_game');
		this.games.splice(this.games.indexOf(game), 1);
		this.server.emit('lobbys', this.sendLobbys(this.games));
		user.lobby_name = newGame.lobby_name;
		this.userService.saveUser(user);
	}
	@SubscribeMessage('start')
	start(client: Socket, payload: any): void {
		// this.gameService.games.push(
		// var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
		// );
		let game = this.games.find((game) => game.lobby_name === payload.lobby_name);
		if (game) {
			game.start = true;
		}
	}
	afterInit(server: Server) {
		this.logger.log('Init');
	}
	@SubscribeMessage('updateLobby')
	updateLobby(client: Socket, payload: any): void {
		const game = this.games.find((game) => game.lobby_name === payload.lobby_name);
		if (game) {
			game.updateBalls(payload.nbrBall);
		}
	}

	// ============================ USER =====================================

	@SubscribeMessage('userUpdate')
	async userUpdate(client: Socket, payload: any): Promise<void> {
		let user = await this.userService.getByLogin(payload.login, {
			requestFriend: true,
			friends: true,
		});
		this.server.emit('userUpdate', new ProfileUserDto(user));
	}
	@SubscribeMessage('getUserByLogin')
	async getUserByLogin(client: Socket, payload: any): Promise<void> {
		const user = await this.userService.getByLogin(payload.login);
		client.emit('getUserByLogin', new ProfileUserDto(user));
	}
	@SubscribeMessage('addFriend')
	addFriend(client: Socket, payload: any): void {
		this.userService.sendFriendRequest(
			payload.sender,
			payload.receiver,
			this.server,
		);
	}
	@SubscribeMessage('removeFriend')
	removeFriend(client: Socket, payload: any): void {
		this.userService.removeFriend(
			payload.sender,
			payload.receiver,
			this.server,
		);
	}
	@SubscribeMessage('getByLoginFiltred')
	async getByLoginFiltred(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) {
		const users = await this.userService.getByLoginFiltred(data);
		let UsersDto: ResumUserDto[] = [];
		for (let i = 0; i < users.length; i++) {
			UsersDto.push(new ResumUserDto(users[i]));
		}
		client.emit('getUsersByLoginFiltred', UsersDto);
	}
	@SubscribeMessage('acceptFriend')
	acceptFriend(client: Socket, payload: any): void {
		this.userService.addFriend(payload.sender, payload.receiver, this.server);
	}
	@SubscribeMessage('declineFriend')
	declineFriend(client: Socket, payload: any): void {
		this.userService.declineFriendRequest(
			payload.sender,
			payload.receiver,
			this.server,
		);
	}
	@SubscribeMessage('changeAvatar')
	changeAvatar(client: Socket, payload: any): void {
		this.logger.log('change avatar');
		this.userService.changeAvatar(payload.login, payload.avatar);
	}

	// @SubscribeMessage('connection')
	// saveSocket(@ConnectedSocket() client: Socket, ...args: any[]) {
	// 	console.log('debut saveSocket');
	// }

	// ============================ CHAT =====================================

	// @SubscribeMessage('message')
	// handleMessage(
	// 	@MessageBody() data: string,
	// 	@ConnectedSocket() client: Socket,
	// ) {
	// 	console.log(`Client message : ${data}`);
	// 	this.server.emit('message', client.id, data);
	// }

	// @SubscribeMessage('getMsgs')
	// async getMsgs(@ConnectedSocket() client: Socket) {
	// 	this.chatService.getMessages().then((res) => {
	// 		console.log(res);
	// 		client.emit('getMsgs', res);
	// 	});
	// }

	// @SubscribeMessage('getPrivConvs')
	// async getPrivConvs(@ConnectedSocket() client: Socket) {
	// 	this.chatService.getPrivConvs().then((res) => {
	// 		console.log(res);
	// 		client.emit('getMsgs', res);
	// 	});
	// }

	@SubscribeMessage('newPrivMsg')
	async NewPrivMsg(
		@MessageBody() data: NewPrivMsgDto,
		@ConnectedSocket() client: Socket,
	) {
		// console.log(`controller newPrivMsg:  userSend = ${data.userSend}, userReceive = ${data.userReceive}`)
		const priv = await this.chatService.addPrivMsg(data);
		// console.log("ici");
		const sendSocketId = (await this.userService.getByLogin(data.userSend))
			.socketId;
		const receiveSocketId = (
			await this.userService.getByLogin(data.userReceive)
		).socketId;
		const msg = new MessageDto(
			data.userSend,
			data.message,
			new Date(data.date),
		);
		// console.log(`sendId = ${sendSocketId}\nreceiveId = ${receiveSocketId}`);
		if (priv.messages.length == 1) {
			const userSend = new BasicUserDto(data.userSend);
			const userReceive = new BasicUserDto(data.userReceive);
			const newPrivSenderDto = new PrivConvDto(userSend, [msg], false, priv.id);
			const newPrivReceiverDto = new PrivConvDto(
				userReceive,
				[msg],
				false,
				priv.id,
			);
			this.server.to(receiveSocketId).emit('newPrivConv', newPrivSenderDto);
			this.server.to(sendSocketId).emit('newPrivConv', newPrivReceiverDto);
		} else {
			this.server
				.to(receiveSocketId)
				.emit('newPrivMsg', { msg: msg, id: priv.id });
			this.server
				.to(sendSocketId)
				.emit('newPrivMsg', { msg: msg, id: priv.id });
			// console.log(`newPrivMsg '${data.message}' emited`)
		}
	}

	@SubscribeMessage('getUsersByLoginFiltred')
	async getUserFiltred(
		@MessageBody() data: { filter: string; login: string },
		@ConnectedSocket() client: Socket,
	) {
		const users = await this.userService.getByLoginFiltred(data.filter);
		const basicInfos: { login: string }[] = [];
		for (let i = 0; i < users.length; i++) {
			if (data.login != users[i].login)
				basicInfos.push({ login: users[i].login });
		}
		client.emit('getUsersByLoginFiltred', basicInfos);
	}

	@SubscribeMessage('privReaded')
	async privReaded(
		@MessageBody() data: { userSend: string; userReceive: string },
		@ConnectedSocket() client: Socket,
	) {
		console.log(
			`privReaded AppGateway , sender = ${data.userSend}, receiver = ${data.userReceive}`,
		);
		// console.log(`userSend = ${data.userSend}, userReceive = ${data.userReceive}`);
		const priv = await this.chatService.getPriv([
			data.userSend,
			data.userReceive,
		]);
		if (!priv) return console.log(`Error privReaded`);
		await this.chatService.markPrivReaded(priv);
	}
}
