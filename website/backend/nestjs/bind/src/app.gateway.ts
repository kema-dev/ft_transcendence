/* eslint-disable @typescript-eslint/no-unused-vars */
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
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;
	game: Game[] = [];
	private logger: Logger = new Logger('AppGateway');

	constructor(
		private readonly chatService: ChatService,
		private readonly userService: UsersService,
	) {}

	// =========================== GENERAL ==================================

	// Connection
	async handleConnection(@ConnectedSocket() client: Socket) {
		console.log(`Client connected : ${client.id}`);
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
		const usr = await this.userService.getByLogin(
			client.handshake.query.login as string,
		);
		for (let i = 0; i < this.game.length; i++) {
			for (let j = 0; j < this.game[i].players.length; j++) {
				if (this.game[i].players[j].login == usr.login) {
					this.game[i].players.splice(j, 1);
					if (this.game[i].players.length < 1) {
						this.game[i].destructor();
						this.game.splice(i, 1);
						break;
					}
					if (this.game[i].owner == usr.login) {
						this.game[i].destructor();
						this.game.splice(i, 1);
						continue;
					}
				}
			}
		}
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
		let game = this.game.find((game) => game.lobby_name === args.lobby_name);
		if (game) game.setMov(args.mov, args.login);
	}
	@SubscribeMessage('newRoom')
	async newRoom(client: Socket, payload: any): Promise<void> {
		// this.gameService.games.push(
		// var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
		// );
		const array: UserEntity[] = [];
		for (let i = 0; i < payload.players.length; i++) {
			array.push(await this.userService.getByLogin(payload.players[i]));
		}
		const usr = await this.userService.getByLogin(
			client.handshake.query.login as string,
		);
		usr.lobby_name = payload.lobby_name;
		this.userService.saveLobby(
			client.handshake.query.login as string,
			payload.lobby_name,
		);
		for (let i = 0; i < this.game.length; i++) {
			for (let j = 0; j < this.game[i].players.length; j++) {
				if (this.game[i].players[j].login == usr.login) {
					this.game[i].players.splice(j, 1);
					if (this.game[i].players.length < 1) {
						this.game[i].destructor();
						this.game.splice(i, 1);
						break;
					}
					if (this.game[i].owner == usr.login) {
						this.game[i].destructor();
						this.game.splice(i, 1);
						continue;
					}
				}
			}
		}
		this.game.push(
			new Game(
				payload.nbrPlayer,
				payload.nbrBall,
				this.server,
				array,
				payload.lobby_name,
				payload.owner,
			),
		);
	}
	@SubscribeMessage('start')
	start(client: Socket, payload: any): void {
		// this.gameService.games.push(
		// var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
		// );
		let game = this.game.find((game) => game.lobby_name === payload.lobby_name);
		if (game) {
			console.log('Game: Starting');
			console.log(payload);
			game.start = true;
		}
	}
	afterInit(server: Server) {
		this.logger.log('Init');
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
		console.log(UsersDto);
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

	@SubscribeMessage('connection')
	saveSocket(@ConnectedSocket() client: Socket, ...args: any[]) {
		console.log('debut saveSocket');
	}

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

	@SubscribeMessage('lobby_list')
	async getLobbyList(@ConnectedSocket() client: Socket) {
		const lobbies: MatchDto[] = [];
		for (const game of this.game) {
			let player_present_in_lobby = false;
			for (let i = 0; i < game.players.length; i++) {
				if (game.players[i].login == client.handshake.query.login) {
					player_present_in_lobby = true;
					break;
				}
			}
			if (player_present_in_lobby == true) {
				continue;
			}
			const players: string[] = [];
			for (const player of game.players) {
				players.push(player.login);
			}
			const lob = new MatchDto(
				game.lobby_name,
				players,
				game.nbrPlayer,
				game.nbrBall,
				game.owner,
				game.start,
			);
			lobbies.push(lob);
		}
		client.emit('lobby_list', lobbies);
	}
	@SubscribeMessage('join_lobby')
	async joinLobby(
		@MessageBody() data: { username: string; lobby: string },
		@ConnectedSocket() client: Socket,
	) {
		console.log('join_lobby: Starting for', data.username);
		for (let i = 0; i < this.game.length; i++) {
			if (this.game[i].lobby_name == data.lobby) {
				if (this.game[i].start) {
					client.emit('join_lobby', 'Game already started');
					return;
				}
				if (this.game[i].players.length == this.game[i].nbrPlayer) {
					client.emit('join_lobby', 'Game is full');
					return;
				}
				for (let j = 0; j < this.game[i].players.length; j++) {
					if (this.game[i].players[j].login == data.username) {
						client.emit('join_lobby', 'User already in lobby');
						return;
					}
				}
				let players = this.game[i].players;
				console.log('players: ', players);
				players.push(await this.userService.getByLogin(data.username));
				this.game[i].destructor();
				this.game.splice(1, i);
				const new_game = new Game(
					this.game[i].nbrPlayer,
					this.game[i].nbrBall,
					this.server,
					players,
					this.game[i].lobby_name,
					this.game[i].owner,
				);
				this.game.push(new_game);
				this.userService.saveLobby(data.username, this.game[i].lobby_name);
				client.emit('join_lobby', 'success');
				for (const player of this.game[i].players) {
					console.log('Sending update to: ', player.login);
					this.server
						.to(player.socketId)
						.emit('reload_game');
				}
			}
		}
		client.emit('join_lobby', 'Lobby not found');
	}
}
