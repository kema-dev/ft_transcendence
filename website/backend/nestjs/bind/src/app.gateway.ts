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
import { PrivConv } from './chat/dto/PrivConv';
import BasicUser from './chat/dto/BasicUser';
import { Message } from './chat/dto/PrivateConvDto';
// import { PrivMsgDto as NewPrivMsgDto } from '../../../../shared/dto/PrivMsgDto';
import UserDto from 'src/users/dto/user.dto';
import ResumUserDto from 'src/users/dto/ResumUserDto';
import ProfileUserDto from 'src/users/dto/ProfileUserDto';

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
	async handleConnection(@ConnectedSocket() client: Socket) {
		console.log(`Client connected : ${client.id}`);
		console.log("query = ", client.handshake.query.login);
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
			this.game.destructor();
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

	// ============================ USER =====================================

	@SubscribeMessage('userUpdate')
	async userUpdate(client: Socket, payload: any): Promise<void> {
		let user = await this.userService.getByLogin(payload.login, { requestFriend: true, friends: true });
		this.server.emit('userUpdate', new ProfileUserDto(user));
	}
	@SubscribeMessage('getUserByLogin')
	async getUserByLogin(client: Socket, payload: any): Promise<void> {
		const user = await this.userService.getByLogin(payload.login);
		client.emit("getUserByLogin", new ProfileUserDto(user));
	}
	@SubscribeMessage('addFriend')
	addFriend(client: Socket, payload: any): void {
		this.userService.sendFriendRequest(payload.sender, payload.receiver, this.server)
	}
	@SubscribeMessage('removeFriend')
	removeFriend(client: Socket, payload: any): void {
		this.userService.removeFriend(payload.sender, payload.receiver, this.server)
	}
	@SubscribeMessage('getByLoginFiltred')
	async getByLoginFiltred(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
		const users = await this.userService.getByLoginFiltred(data);
		let UsersDto: ResumUserDto[] = [];
		for (let i = 0; i < users.length; i++) {
			UsersDto.push(new ResumUserDto(users[i]));
		}
		console.log(UsersDto);
		client.emit("getUsersByLoginFiltred", UsersDto);
	}
	@SubscribeMessage('acceptFriend')
	acceptFriend(client: Socket, payload: any): void {
		this.userService.addFriend(payload.sender, payload.receiver, this.server);
	}
	@SubscribeMessage('declineFriend')
	declineFriend(client: Socket, payload: any): void {
		this.userService.declineFriendRequest(payload.sender, payload.receiver, this.server);
	}
	@SubscribeMessage('changeAvatar')
	changeAvatar(client: Socket, payload: any): void {
		this.logger.log('change avatar');
		this.userService.changeAvatar(payload.login, payload.avatar);
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
	async NewPrivMsg(@MessageBody() data: NewPrivMsgDto, @ConnectedSocket() client: Socket) {
		// console.log(`controller newPrivMsg:  userSend = ${data.userSend}, userReceive = ${data.userReceive}`)
		const priv = await this.chatService.addPrivMsg(data);
		// console.log("ici");
		const sendSocketId = (await this.userService.getByLogin(data.userSend)).socketId;
		const receiveSocketId = (await this.userService.getByLogin(data.userReceive)).socketId;
		const msg = new Message(data.userSend, data.message, new Date(data.date));
		// console.log(`sendId = ${sendSocketId}\nreceiveId = ${receiveSocketId}`);
		if (priv.messages.length == 1) {
			const userSend = new BasicUser(data.userSend);
			const userReceive = new BasicUser(data.userReceive);
			const newPrivSenderDto = new PrivConv(userSend, [msg], false, priv.id);
			const newPrivReceiverDto = new PrivConv(userReceive, [msg], false, priv.id);
			this.server.to(receiveSocketId).emit("newPrivConv", newPrivSenderDto);
			this.server.to(sendSocketId).emit("newPrivConv", newPrivReceiverDto);
		}
		else {
			this.server.to(receiveSocketId).emit("newPrivMsg", { msg: msg, id: priv.id });
			this.server.to(sendSocketId).emit("newPrivMsg", { msg: msg, id: priv.id });
			// console.log(`newPrivMsg '${data.message}' emited`)
		}
	}

	@SubscribeMessage("getUsersByLoginFiltred")
	async getUserFiltred(@MessageBody() data: { filter: string, login: string }, @ConnectedSocket() client: Socket) {
		const users = await this.userService.getByLoginFiltred(data.filter);
		let basicInfos: { login: string }[] = [];
		for (let i = 0; i < users.length; i++) {
			if (data.login != users[i].login)
				basicInfos.push({ login: users[i].login });
		}
		client.emit("getUsersByLoginFiltred", basicInfos);
	}

	@SubscribeMessage("privReaded")
	async privReaded(@MessageBody() data: { userSend: string, userReceive: string }, @ConnectedSocket() client: Socket) {
		console.log(`privReaded AppGateway , socketid = ${client.id}`);
		// console.log(`userSend = ${data.userSend}, userReceive = ${data.userReceive}`);
		let priv = await this.chatService.getPrivMsg(data.userSend, data.userReceive);
		if (!priv)
			return console.log(`Error privReaded`);
		return await this.chatService.markPrivReaded(priv);
	}
}
