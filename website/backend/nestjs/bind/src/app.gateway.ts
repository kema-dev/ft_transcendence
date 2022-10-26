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
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import Vector from './game2.0/objects/Vector';
import Game from './game2.0/Game';
import { ChatService } from './chat/chat.service';
import { UsersService } from './users/users.service';
import { BallDto } from './game2.0/dto/BallDto';
import { NewPrivMsgDto } from './chat/dto/NewPrivMsgDto';
import { NewChanMsgDto } from './chat/dto/NewChanMsgDto';
import { PrivConvDto } from './chat/dto/PrivConvDto';
import { MessageDto } from './chat/dto/MessageDto';
import ProfileUserDto from 'src/users/dto/ProfileUserDto';
import ResumUserDto from 'src/users/dto/ResumUserDto';
import { BasicUserDto } from 'src/chat/dto/BasicUserDto';
import { ModifChanDto } from './chat/dto/ModifChanDto';
import { UserEntity } from 'src/users/user.entity';
import { MatchDto } from 'src/match/match.dto';
import { MatchService } from './match/match.service';
import { delay } from 'rxjs';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})

@Injectable()
export class AppGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	games: Game[] = [];
	private logger: Logger = new Logger('AppGateway');

	constructor(
		private readonly chatService: ChatService,
		private readonly userService: UsersService,
		private readonly matchService: MatchService,
	) { }

	// =========================== GENERAL ==================================

	// Connection
	async handleConnection(@ConnectedSocket() client: Socket) {
		let login = client.handshake.query.login as string; 
		this.logger.log(`Client connected : ${login}`);
		await this.userService.saveSocket(login, client.id);
		this.userService.set_status(login, 'online');
	}
	// Disconnection
	async handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		this.leftGame({ login: client.handshake.query.login as string });
	}

	// ============================ GAME =====================================


	@SubscribeMessage('leftGame')
	async leftGame(@MessageBody() data: { login: string }) {
		console.log('leftGame <---------------------------', data.login);
		const user = await this.userService.getByLogin(data.login);
		if (!user) return;
		let game = this.games.find((game) => game.lobby_name === user.lobby_name);
		if (!game) {
			user.lobby_name = "";
			this.userService.saveUser(user);
			return;
		}
		console.log('lobby <---------------------------', user.lobby_name);
		console.log('game <---------------------------');
		user.lobby_name = "";
		this.userService.saveUser(user);
		game.destructor();
		if (game.players.length - 1 > 0) {
			console.log('game.players.length - 1 > 0');
			let newGame = new Game(
				game.nbrPlayer - 1,
				game.nbrBall,
				this.server,
				game.players.filter((player) => player.login !== user.login),
				game.lobby_name,
				game.owner,
				game.img,
				this.matchService,
				this
			);
			this.games.push(newGame);
			this.server.to(newGame.sockets).emit('reload_game', { left: user.login });
			newGame.start = game.start;
			if (game.players.length - 1 == 1 && game.start) {
				this.server.to(game.players.find((player) => player.login !== user.login).socketId).emit('end', { win: true });
				newGame.start = false;
			}
		}
		this.games.splice(this.games.indexOf(game), 1);
		this.server.emit('lobbys', this.sendLobbys(this.games));
		console.log('game destroyed', this.games.length);
	}
	// @SubscribeMessage('getBallPos')
	// getBallsPos(client: Socket, payload: any): any {
	// 	this.server.emit('getBallPos', this.game[0].balls);
	// 	this.logger.log(`Message: ${payload}`);
	// 	return this.game[0].balls;
	// }
	@SubscribeMessage('setMov')
	setMov(client: Socket, args: any): void {
		// console.log('setMov');
		// console.log(args);
		let game = this.games.find((game) => game.lobby_name === args.lobby_name);
		if (game) game.setMov(args.mov, args.login);
		// console.log(args.lobby_name);
	}
	@SubscribeMessage('newLobby')
	async newLobby(@MessageBody() data: { login: string, nbrBall: number },
		@ConnectedSocket() client: Socket): Promise<void> {
		let user = await this.userService.getByLogin(data.login, {
			requestFriend: true,
			friends: true,
		});
		if (!user) return;
		const lobby_name = user.login + "'s lobby";
		this.games.find((game) => game.lobby_name === lobby_name);
		if (this.games.find((game) => game.lobby_name === lobby_name)) {
			return;
		}
		let game = new Game(
			1,
			data.nbrBall,
			this.server,
			[user],
			user.login + "'s lobby",
			user.login,
			user.avatar,
			this.matchService,
			this
		);
		console.log('newLobby', game.lobby_name);
		this.games.push(game);
		user.lobby_name = game.lobby_name;
		this.userService.saveUser(user);
		this.server.to(user.socketId).emit('userUpdate', new ProfileUserDto(user));
		this.server.emit('lobbys', this.sendLobbys(this.games));
	}
	sendLobbys(games: Game[]) {
		let lobbys: MatchDto[] = [];
		games.forEach((game) => {
			lobbys.push(new MatchDto(game));
			// console.log(game.img, lobbys[lobbys.length - 1].img);
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
		console.log(
			'join_lobby: Starting for',
			'login:',
			data.login,
			'lobby:',
			data.lobby,
		);
		const game = this.games.find((game) => game.lobby_name == data.lobby);
		if (!game) {
			console.log('join_lobby: Game not found, Returning');
			return;
		}
		console.log('join_lobby: game found');
		let user = await this.userService.getByLogin(data.login, {
			requestFriend: true,
			friends: true,
		});
		if (!user) {
			console.log('join_lobby: User not found, Returning');
			return;
		}
		console.log('join_lobby: user found');
		if (game.players.length >= 7) {
			console.log('join_lobby: Game is full, Returning');
			return;
		}
		if (game.start) {
			console.log('join_lobby: Game is already started, Returning');
			return;
		}
		if (game.players.find((player) => player.login === user.login)) {
			console.log('join_lobby: User is already in the game, Returning');
			return;
		}
		// check if user is already in a game
		if (this.games.find((game) => game.players.find((player) => player.login === user.login))) {
			console.log('join_lobby: User is already in a game, Returning');
			this.server.to(user.socketId).emit('request_game_leave');
			return;
		}
		let newGame = new Game(
			game.nbrPlayer + 1,
			game.nbrBall,
			this.server,
			game.players.concat(user),
			game.lobby_name,
			game.owner,
			game.img,
			this.matchService,
			this
		);
		console.log('join_lobby: newGame created');
		game.destructor();
		this.games.push(newGame);
		this.server.to(newGame.sockets).emit('reload_game');
		this.games.splice(this.games.indexOf(game), 1);
		this.server.emit('lobbys', this.sendLobbys(this.games));
		console.log(newGame.lobby_name);
		user.lobby_name = newGame.lobby_name;
		this.userService.saveUser(user);
		this.server.to(user.socketId).emit('userUpdate', new ProfileUserDto(user));
		this.server.to(user.socketId).emit('accept_success');
		console.log('join_lobby: Success, returning');
	}
	@SubscribeMessage('start')
	start(client: Socket, payload: any): void {
		// this.gameService.games.push(
		// var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
		// );
		let game = this.games.find((game) => game.lobby_name === payload.lobby_name);
		if (game) {
			game.players.forEach((player) => {
				this.userService.set_status(player.login, 'ingame');
			});
			game.start = true;
			this.server.emit('lobbys', this.sendLobbys(this.games));
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
			this.server.to(game.sockets).emit('reload_game');
		}
	}

	// ============================ USER =====================================

	@SubscribeMessage('userUpdate')
	async userUpdate(client: Socket, payload: any): Promise<void> {
		let user = await this.userService.getByLogin(payload.login, {
			requestFriend: true,
			friends: true,
			blockeds: true,
		});
		this.server.to(user.socketId).emit('userUpdate', new ProfileUserDto(user));
	}
	@SubscribeMessage('getUserByLogin')
	async getUserByLogin(client: Socket, payload: any): Promise<void> {
		try {
			const user = await this.userService.getByLogin(payload.login);
			client.emit('getUserByLogin', new ProfileUserDto(user));
		}
		catch (e) {
			client.emit('getUserByLogin', null);
		}
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
		@MessageBody() data: { me: string, search: string },
		@ConnectedSocket() client: Socket,
	) {
		console.log(`me = ${data.me}, search = ${data.search}`)
		let users = await this.userService.getByLoginFiltred(data.search);
		users = users.filter(u => u.login != data.me);
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

	@SubscribeMessage('userStatus')
	async get_user_status(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) {
		let statusString = await this.userService.get_user_status(data);
		let status: boolean;
		statusString == "online" ? status = true : status = false;
		client.emit("userStatus", { user: data, status: status });
	}

	@SubscribeMessage('userLogout')
	async userLogout(@MessageBody() data: string) {
		this.server.emit("userStatus", { user: data, status: false })
	}

	@SubscribeMessage('userLogin')
	async userLogin(@MessageBody() data: string) {
		this.server.emit("userStatus", { user: data, status: true })
	}

	@SubscribeMessage('blockUser')
	async blockUser(
		@MessageBody() data: { blocker: string, blocked: string },
		@ConnectedSocket() client: Socket,
	) {
		let blocked = await this.chatService.blockUser(data);
		client.emit('userBlock', new ResumUserDto(blocked));
	}

	@SubscribeMessage('unblockUser')
	async unblockUser(
		@MessageBody() data: { blocker: string, blocked: string },
		@ConnectedSocket() client: Socket,
	) {
		let priv = await this.chatService.unblockUser(data, this.server);
		client.emit('userUnblock', priv);
	}

	// ============================ CHAT =====================================

	// ========== PRIVATES

	@SubscribeMessage('newPrivMsg')
	async NewPrivMsg(
		@MessageBody() data: NewPrivMsgDto,
		@ConnectedSocket() client: Socket,
	) {
		const priv = await this.chatService.addPrivMsg(data);
		const sender = await this.userService.getByLogin(data.userSend);
		const receiver = await this.userService.getByLogin(data.userReceive);
		const msg = new MessageDto(
			data.userSend,
			data.message,
			new Date(data.date),
		);
		if (priv.messages.length == 1) {
			const userSend = new BasicUserDto(sender.login, sender.avatar);
			const userReceive = new BasicUserDto(receiver.login, receiver.avatar);
			const privSenderDto = new PrivConvDto(userSend, [msg], false, priv.id);
			const privReceiverDto = new PrivConvDto(
				userReceive,
				[msg],
				false,
				priv.id,
			);
			this.server.to(receiver.socketId).emit('newPrivConv', privSenderDto);
			this.server.to(sender.socketId).emit('newPrivConv', privReceiverDto);
			this.server.to(sender.socketId).emit('findNewPriv');
		} else {
			this.server
				.to(receiver.socketId)
				.emit('newPrivMsg', { msg: msg, id: priv.id });
			this.server
				.to(sender.socketId)
				.emit('newPrivMsg', { msg: msg, id: priv.id });
		}
	}

	@SubscribeMessage('privReaded')
	async privReaded(
		@MessageBody() data: { sender: string; receiver: string },
		@ConnectedSocket() client: Socket,
	) {
		this.chatService.markPrivReaded(data.sender, data.receiver);
	}

	// ========== CHANNELS

	@SubscribeMessage('newChanMsg')
	async NewChanMsg(
		@MessageBody() data: NewChanMsgDto,
		@ConnectedSocket() client: Socket,
	) {
		const chan = await this.chatService.addChanMsg(data);
		const msg = new MessageDto(
			data.userSend,
			data.message,
			new Date(data.date),
		);
		for (let user of chan.admins.concat(chan.users).concat(chan.mutes)) {
			this.server
				.to(user.socketId)
				.emit('newChanMsg', { msg: msg, name: chan.name });
		}
	}

	@SubscribeMessage('newChannelUser')
	async newChannelUser(
		@MessageBody() data: { chan: string, login: string },
		@ConnectedSocket() client: Socket,
	) {
		this.chatService.newChannelUser(this.server, data);
	}

	@SubscribeMessage('userQuitChan')
	async userQuitChan(
		@MessageBody() data: { login: string, chan: string },
		@ConnectedSocket() client: Socket,
	) {
		this.chatService.userQuitChan(this.server, data);
	}

	@SubscribeMessage('modifChan')
	async modifChan(
		@MessageBody() data: ModifChanDto,
		@ConnectedSocket() client: Socket,
	) {
		try {
			this.chatService.modifChan(this.server, data);
		}
		catch (e) {
			console.log(e);
		}
	}

	@SubscribeMessage('invite_to_game')
	async invite_to_game(
		@MessageBody() data: { login: string },
		@ConnectedSocket() client: Socket,
	) {
		console.log(
			'invite_to_game: Start for,',
			data.login,
			'from',
			client.handshake.query.login,
		);
		let game;
		let inviter_in_sock = false;
		for (game of this.games) {
			// check if client.handshake.query.login is in game
			for (const sock of game.sockets) {
				if (sock == client.id) {
					inviter_in_sock = true;
					break;
				}
			}
			if (inviter_in_sock == true) {
				break;
			}
		}
		if (inviter_in_sock) {
			let inviter_in_game = false;
			for (game of this.games) {
				// check if client.handshake.query.login is in game
				for (const player of game.players) {
					if (player.login == client.handshake.query.login) {
						inviter_in_game = true;
						break;
					}
				}
				if (inviter_in_game == true) {
					break;
				}
			}
			if (!inviter_in_game) {
				console.log('invite_to_game: Inviter is in spec, re running function');
				game.sockets.splice(game.sockets.indexOf(client.id), 1);
				this.server.to(client.id).emit('reload_game');
				this.invite_to_game(data, client);
				return;
			}
		}
		let inviter_in_game = false;
		for (game of this.games) {
			// check if client.handshake.query.login is in game
			for (const player of game.players) {
				if (player.login == client.handshake.query.login) {
					inviter_in_game = true;
					break;
				}
			}
			if (inviter_in_game == true) {
				break;
			}
		}
		if (!inviter_in_game) {
			console.log('invite_to_game: No game found, returning');
			client.emit('create_from_invitation');
			// wait 1 sec for client to create game
			const delay = (time: number) =>
				new Promise((resolve) => setTimeout(resolve, time));
			await delay(100);
			client.emit('invite_to_game', { error: 'no game' });
			return;
		}
		console.log('invite_to_game: Game found');
		let user;
		try {
			user = await this.userService.getByLogin(data.login);
		} catch (e) {
			client.emit('invite_to_game', { error: 'no user' });
			console.log('invite_to_game: No user found, returning');
			return;
		}
		console.log('invite_to_game: User found');
		if (user.status != 'online') {
			client.emit('invite_to_game', { error: 'no online' });
			console.log('invite_to_game: User not online, returning');
			return;
		}
		console.log('invite_to_game: User online');
		this.server.to(user.socketId).emit('get_invited', {
			login: user.login,
			lobby: game.lobby_name,
		});
		this.server.to(user.socketId).emit('update_invitations', {});
		console.log('invite_to_game: Success, returning');
	}

	@SubscribeMessage('get_match_infos')
	async get_match_infos(
		@MessageBody() data: { lobby: string },
		@ConnectedSocket() client: Socket,
	) {
		let game;
		for (game of this.games) {
			if (game.lobby_name == data.lobby) {
				break;
			}
		}
		if (!game) {
			// client.emit('get_match_infos', { error: 'no game' });
			return;
		}
		// extract player names
		const players = [];
		for (const curr of game.players) {
			players.push(curr.login);
		}
		client.emit('get_match_infos', {
			nbrPlayer: game.nbrPlayer,
			nbrBall: game.nbrBall,
			lobby_name: game.lobby_name,
			players: players,
			owner: game.owner
		});
	}

	@SubscribeMessage('deny_invit')
	async deny_invit(
		@MessageBody() data: { game: string },
		@ConnectedSocket() client: Socket,
	) {
		client.emit('remove_invit', data.game);
	}
}
