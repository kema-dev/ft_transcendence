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
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;
	games: Game[] = [];
	private logger: Logger = new Logger('AppGateway');

	constructor(
		private readonly chatService: ChatService,
		private readonly userService: UsersService,
		private readonly matchService: MatchService,
	) {
		setInterval(async () => {
			this.chatService.checkSanctions(this.server);
		}, 1000);
	}

	// =========================== GENERAL ==================================

	// Connection
	async handleConnection(@ConnectedSocket() client: Socket) {
		const user = client.handshake.query.login as string;
		this.logger.log(`Client connected : ${user}`);
		await this.userService.saveSocket(user, client.id);
		this.userService.set_status(user, 'online');
		this.server.emit('userStatus', { user: user, status: 'online' });
	}
	// Disconnection
	async handleDisconnect(client: Socket) {
		const user = client.handshake.query.login as string;
		this.logger.log(`Client disconnected: ${user}`);
		this.leftGame({ login: user });
		this.server.emit('userStatus', { user: user, status: 'offline' });
	}

	// ============================ GAME =====================================

	@SubscribeMessage('leftGame')
	async leftGame(@MessageBody() data: any) {
		console.log('leftGame <---------------------------', data.login);
		const user: UserEntity = await this.userService.getByLogin(data.login);
		if (!user) return;
		const game = this.games.find((game) => game.lobby_name === user.lobby_name);
		this.userService.set_status(user.login, 'online');
		this.server.emit('userStatus', { user: user.login, status: 'online' });
		user.lobby_name = '';
		user.level = user.level + 1;
		this.userService.saveUser(user);
		if (!game) {
			for (const g of this.games)
				for (const sock of g.socketsViewers)
					if (sock == user.socketId) {
						g.socketsViewers.splice(g.socketsViewers.indexOf(sock), 1);
						g.sockets.splice(g.sockets.indexOf(sock), 1);
						return;
					}
			return;
		}
		console.log('lobby <---------------------------', user.lobby_name);
		console.log('game <---------------------------');
		game.destructor();
		if (
			(game.players.length - 1 >= 1 && !game.start) ||
			game.players.length - 1 > 1
		) {
			console.log('game.players.length - 1 > 0');
			let new_owner: UserEntity;
			let new_owner_login: UserEntity[];
			if (game.owner == user.login) {
				new_owner_login = game.players.filter(
					(player) => player.login !== user.login,
				);
				for (const remaining_players of new_owner_login) {
					this.server.to(remaining_players.socketId).emit('owner_change');
				}
			}
			let game_owner: string;
			if (!new_owner) {
				game_owner = game.owner;
			} else {
				game_owner = new_owner.login;
			}
			const newGame = new Game(
				game.nbrPlayer - 1,
				game.nbrBall,
				this.server,
				game.players.filter((player) => player.login !== user.login),
				game.lobby_name,
				game_owner,
				game.img,
				this.matchService,
				this,
			);
			this.games.push(newGame);
			if (data.lose)
				this.server
					.to(newGame.sockets)
					.emit('reload_game', { left: '', start: newGame.start });
			else
				this.server
					.to(newGame.sockets)
					.emit('reload_game', { left: user.login, start: newGame.start });
			newGame.start = game.start;
		} else if (game.players.length - 1 == 1) {
			this.server
				.to(game.players.find((player) => player.login !== user.login).socketId)
				.emit('end', { win: true });
			if (!data.lose)
				this.server
					.to(
						game.players.find((player) => player.login !== user.login).socketId,
					)
					.emit('reload_game', { left: user.login, start: game.start });
		}
		this.userService.saveUser(user);
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
		const game = this.games.find((game) => game.lobby_name === args.lobby_name);
		if (game) game.setMov(args.mov, args.login);
		// console.log(args.lobby_name);
	}
	@SubscribeMessage('newLobby')
	async newLobby(
		@MessageBody() data: { login: string; nbrBall: number },
		@ConnectedSocket() client: Socket,
	): Promise<void> {
		const user = await this.userService.getByLogin(data.login, {
			requestFriend: true,
			friends: true,
		});
		if (!user) return;
		const lobby_name = user.login + "'s lobby";
		this.games.find((game) => game.lobby_name === lobby_name);
		if (this.games.find((game) => game.lobby_name === lobby_name)) {
			return;
		}
		const newGame = new Game(
			1,
			data.nbrBall,
			this.server,
			[user],
			user.login + "'s lobby",
			user.login,
			user.avatar,
			this.matchService,
			this,
		);
		newGame.socketsViewers = newGame.socketsViewers;
		for (const sock of newGame.socketsViewers) newGame.sockets.push(sock);
		console.log('newLobby', newGame.lobby_name);
		this.games.push(newGame);
		user.lobby_name = newGame.lobby_name;
		user.status = 'ingame';
		this.userService.saveUser(user);
		this.server.to(user.socketId).emit('userUpdate', new ProfileUserDto(user));
		this.server.emit('lobbys', this.sendLobbys(this.games));
	}
	sendLobbys(games: Game[]) {
		const lobbys: MatchDto[] = [];
		games.forEach((game) => {
			lobbys.push(new MatchDto(game));
			// console.log(game.img, lobbys[lobbys.length - 1].img);
		});
		return lobbys;
	}
	@SubscribeMessage('look_lobby2')
	async lookLobby2(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { spec: string; player: string },
	) {
		const user = await this.userService.getByLogin(data.spec);
		if (!user) return;
		if (user.status != 'online') return;
		console.log('look_lobby2', data.spec);
		const lobbyName = (await this.userService.getByLogin(data.player))
			.lobby_name;
		this.lookLobby(client, { login: data.spec, lobby_name: lobbyName });
	}
	@SubscribeMessage('look_lobby')
	async lookLobby(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { login: string; lobby_name: string },
	) {
		const user = await this.userService.getByLogin(data.login);
		if (!user) return;
		if (user.status != 'online') return;
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
			this.server.to(client.id).emit('join_failure');
			return;
		}
		console.log('join_lobby: game found');
		const user = await this.userService.getByLogin(data.login, {
			requestFriend: true,
			friends: true,
		});
		if (!user) {
			console.log('join_lobby: User not found, Returning');
			this.server.to(client.id).emit('join_failure');
			return;
		}
		console.log('join_lobby: user found');
		if (game.players.length >= 7) {
			console.log('join_lobby: Game is full, Returning');
			this.server.to(client.id).emit('join_failure');
			return;
		}
		if (game.start) {
			console.log('join_lobby: Game is already started, Returning');
			this.server.to(client.id).emit('join_failure');
			return;
		}
		if (game.players.find((player) => player.login === user.login)) {
			console.log('join_lobby: User is already in the game, Returning');
			this.server.to(client.id).emit('join_failure');
			return;
		}
		// check if user is already in a game
		if (
			this.games.find((game) =>
				game.players.find((player) => player.login === user.login),
			)
		) {
			console.log('join_lobby: User is already in a game, Returning');
			this.server.to(user.socketId).emit('request_game_leave');
			this.server.to(client.id).emit('join_failure');
			return;
		}
		// check if client.id is already in a game.sockets
		if (
			this.games.find((game) =>
				game.sockets.find((socket) => socket === client.id),
			)
		) {
			console.log(
				'join_lobby: Client is already a viewer of ',
				game.lobby_name,
				', returning',
			);
			this.server.to(user.socketId).emit('request_spectate_leave');
			game.sockets.splice(game.sockets.indexOf(client.id), 1);
			this.server.to(client.id).emit('join_failure');
			return;
		}
		const newGame = new Game(
			game.nbrPlayer + 1,
			game.nbrBall,
			this.server,
			game.players.concat(user),
			game.lobby_name,
			game.owner,
			game.img,
			this.matchService,
			this,
		);
		newGame.socketsViewers = game.socketsViewers;
		for (const sock of game.socketsViewers) newGame.sockets.push(sock);
		console.log('join_lobby: newGame created');
		game.destructor();
		this.games.push(newGame);
		this.server
			.to(newGame.sockets)
			.emit('reload_game', { left: '', start: newGame.start });
		this.games.splice(this.games.indexOf(game), 1);
		this.server.emit('lobbys', this.sendLobbys(this.games));
		console.log(newGame.lobby_name);
		user.lobby_name = newGame.lobby_name;
		user.status = 'ingame';
		this.userService.saveUser(user);
		this.server.to(user.socketId).emit('userUpdate', new ProfileUserDto(user));
		this.server.to(user.socketId).emit('flush_invitations');
		this.server.to(user.socketId).emit('accept_success');
		console.log('join_lobby: Success, returning');
	}
	@SubscribeMessage('start')
	start(client: Socket, payload: any): void {
		// this.gameService.games.push(
		// var game = new Game(payload.nbrPlayer, payload.nbrBall, this.server)
		// );
		const game = this.games.find(
			(game) => game.lobby_name === payload.lobby_name,
		);
		if (game) {
			game.players.forEach((player) => {
				this.userService.set_status(player.login, 'ingame');
				this.server.emit('userStatus', {
					user: player.login,
					status: 'ingame',
				});
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
		const game = this.games.find(
			(game) => game.lobby_name === payload.lobby_name,
		);
		if (game) {
			game.updateBalls(payload.nbrBall);
			this.server
				.to(game.sockets)
				.emit('reload_game', { left: '', start: game.start });
		}
	}

	// ============================ USER =====================================

	@SubscribeMessage('userUpdate')
	async userUpdate(client: Socket, payload: any): Promise<void> {
		const user = await this.userService.getByLogin(payload.login, {
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
		} catch (e) {
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
		@MessageBody() data: { me: string; search: string },
		@ConnectedSocket() client: Socket,
	) {
		console.log(`me = ${data.me}, search = ${data.search}`);
		let users = await this.userService.getByLoginFiltred(data.search);
		users = users.filter((u) => u.login != data.me);
		const UsersDto: ResumUserDto[] = [];
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
		this.userService.changeAvatar(payload.login, payload.avatar);
	}
	@SubscribeMessage('userStatus')
	async get_user_status(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getBySocketId(client.id);
		if (!sender) {
			console.log(`get_user_status error: Sender user not found"`);
			return;
		}
		const status = await this.userService.get_user_status(data);
		client.emit('userStatus', { user: data, status: status });
	}

	@SubscribeMessage('blockUser')
	async blockUser(
		@MessageBody() data: { blocked: string },
		@ConnectedSocket() client: Socket,
	) {
		const blocker = await this.userService.getBySocketId(client.id);
		if (!blocker) {
			console.log(`blockUser error: blocker user not found"`);
			return;
		}
		const blocked = await this.chatService.blockUser(
			blocker.login,
			data.blocked,
		);
		client.emit('userBlock', new ResumUserDto(blocked));
	}

	@SubscribeMessage('unblockUser')
	async unblockUser(
		@MessageBody() data: { blocked: string },
		@ConnectedSocket() client: Socket,
	) {
		const blocker = await this.userService.getBySocketId(client.id);
		if (!blocker) {
			console.log(`blockUser error: blocker user not found"`);
			return;
		}
		this.chatService.unblockUser(blocker.login, data.blocked, this.server);
	}

	// ============================ CHAT =====================================

	// ========== PRIVATES

	@SubscribeMessage('newPrivMsg')
	async NewPrivMsg(
		@MessageBody() data: NewPrivMsgDto,
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getBySocketId(client.id);
		if (!sender) {
			console.log(`NewPrivMsg error: Sender user not found"`);
			return;
		}
		const priv = await this.chatService.addPrivMsg(sender, data);
		if (!priv) return;
		const receiver = await this.userService.getByLogin(data.userReceive);
		const msg = new MessageDto(sender.login, data.message, new Date(data.date));
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
		@MessageBody() data: { sender: string },
		@ConnectedSocket() client: Socket,
	) {
		const receiver = await this.userService.getBySocketId(client.id);
		if (!receiver) {
			console.log(`privReaded error : Receiver user not found`);
			return;
		}
		const sender = await this.userService.getByLogin(data.sender);
		if (!sender) {
			console.log(`privReaded error : Sender user not found`);
			return;
		}
		this.chatService.markPrivReaded(sender.login, receiver.login);
	}

	// ========== CHANNELS

	@SubscribeMessage('newChanMsg')
	async NewChanMsg(
		@MessageBody() data: NewChanMsgDto,
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getBySocketId(client.id);
		if (!sender) {
			console.log(`NewChanMsg error: Sender user not found"`);
			return;
		}
		const chan = await this.chatService.addChanMsg(sender, data);
		if (!chan) return;
		const msg = new MessageDto(sender.login, data.message, new Date(data.date));
		const allUsers = this.chatService.getAllChanUsers(chan);
		for (const user of allUsers) {
			this.server
				.to(user.socketId)
				.emit('newChanMsg', { msg: msg, name: chan.name });
		}
	}

	@SubscribeMessage('newChannelUser')
	async newChannelUser(
		@MessageBody() data: { chan: string; login: string },
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getBySocketId(client.id);
		if (!sender) {
			console.log(`newChannelUser error: Sender user not found"`);
			return;
		}
		this.chatService.newChannelUser(this.server, data);
	}

	@SubscribeMessage('userQuitChan')
	async userQuitChan(
		@MessageBody() data: { login: string; chan: string },
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getBySocketId(client.id);
		if (!sender) {
			console.log(`userQuitChan error: Sender user not found"`);
			return;
		}
		this.chatService.userQuitChan(this.server, sender.login, data.chan);
	}

	@SubscribeMessage('modifChan')
	async modifChan(
		@MessageBody() data: ModifChanDto,
		@ConnectedSocket() client: Socket,
	) {
		const sender = await this.userService.getBySocketId(client.id);
		if (!sender) {
			console.log(`modifChan error: Sender user not found"`);
			return;
		}
		this.chatService.modifChan(this.server, sender, data);
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
				this.server
					.to(client.id)
					.emit('reload_game', { left: '', start: game.start });
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
			// wait 0.1 sec for client to create game
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
			owner: game.owner,
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
