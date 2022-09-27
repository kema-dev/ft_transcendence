/* eslint-disable @typescript-eslint/no-unused-vars */
import { Socket, Server } from 'socket.io';
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

import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MessageEntity } from './entites/message.entity';
import { PrivateEntity } from './entites/private.entity';
import { ChannelEntity } from './entites/channel.entity';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewPrivMsgDto } from './dto/NewPrivMsgDto';
import { NewChanMsgDto } from './dto/NewChanMsgDto';
import { BasicUserDto } from './dto/BasicUserDto';
import { MessageDto } from './dto/MessageDto';
import { PrivConvDto } from './dto/PrivConvDto';
import { ChannelDto } from './dto/ChannelDto';
import { HttpService } from '@nestjs/axios';
import { timeStamp } from 'console';
import { NewChanDto } from './dto/NewChanDto';
import { ChannelTabDto } from './dto/ChannelTabDto ';
// import { AppGateway } from '../app.gateway';

@Injectable()
// export class ChatService {
export class ChatService {
	constructor(
		@InjectRepository(MessageEntity)
		private msgRepository: Repository<MessageEntity>,
		@InjectRepository(PrivateEntity)
		private privateRepository: Repository<PrivateEntity>,
		@InjectRepository(ChannelEntity)
		private channelRepository: Repository<ChannelEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private readonly userService: UsersService,
		
    // private readonly appGateway: AppGateway,
		// @Inject(forwardRef(() => AppGateway))
    // private readonly appGateway: AppGateway,
	) {}

	@WebSocketServer() server: Server;

	// ========================= PRIVATES =========================

	async getUserPrivs(login: string) {
		const user = await this.userRepository.findOne({
			relations: { privates: { users: true, messages: { user: true } } },
			where: { login: login },
			order: {
				privates: {
					messages: {
						createdAt: 'ASC',
					},
				},
			},
		});
		return user.privates;
}

	async getPriv(logins: [string, string]) {
		const privates = await this.privateRepository.find({
			relations: {
				users: true,
				messages: {
					user: true,
				},
			},
			order: {
				messages: {
					createdAt: 'ASC',
				},
			},
		});
		const priv = privates.find((item) => {
			if (
				(item.users[0].login == logins[0] &&
					item.users[1].login == logins[1]) ||
				(item.users[0].login == logins[1] && item.users[1].login == logins[0])
			)
				return true;
		});
		return priv;
	}

	async addPrivMsg(data: NewPrivMsgDto) {
		console.log(`addPrivMsg Chatservice, msg = '${data.message}'`);
		// Find users
		const userSend = await this.userService.getByLogin(data.userSend);
		const userReceive = await this.userService.getByLogin(data.userReceive);
		// Create and save Msg
		const msg = this.msgRepository.create({
			user: userSend,
			message: data.message,
		});
		await this.msgRepository
			.save(msg)
			.catch((e) => console.log('Save msg error'));
		// Check if PrivConv exist
		const priv = await this.getPriv([data.userSend, data.userReceive]);
		// If PrivateConv exist => add message to the existing one
		if (priv) {
			console.log(`PrivConv already exist`);
			priv.messages.push(msg);
			priv.readed = false;
			await this.privateRepository
				.save(priv)
				.catch((e) => console.log('Save priv error'));
			return priv;
		}
		// else => Create a new PrivateConv
		else {
			console.log('creation New PrivateConv');
			const newPriv = this.privateRepository.create({ readed: false });
			newPriv.users = [userSend, userReceive];
			newPriv.messages = [msg];
			newPriv.readed = false;
			await this.privateRepository
				.save(newPriv)
				.catch((e) => console.log('Save newPriv error'));
			return newPriv;
		}
	}

	async sortPrivs(privs: PrivateEntity[]) {
		privs.sort(function (x, y) {
			if ( x.messages.at(-1).createdAt.getTime() 
				< y.messages.at(-1).createdAt.getTime()) 
				return 1;
			return -1;
		});
	}

	async createPrivsDto(requestor: string, privs: PrivateEntity[]) {
		const privsDto: PrivConvDto[] = [];
		for (let priv of privs) {
			let login: string;
			if (priv.users[0].login == requestor) login = priv.users[1].login;
			else login = priv.users[0].login;
			console.log(`login = ${login}`);
			const user = await this.userService.getByLogin(login);
			const basicUser = new BasicUserDto(user.login, user.avatar);
			const read = priv.readed;
			const msgs: MessageDto[] = [];
			const id = priv.id;
			priv.messages.forEach((msg) =>
				msgs.push(new MessageDto(msg.user.login, msg.message, msg.createdAt)),
			);
			let newPrivDto = new PrivConvDto(basicUser, msgs, read, id);
			privsDto.push(newPrivDto);
		};
		return privsDto;
	}

	async getServerUsersFiltred(login: string, filter: string) {
		const users = await this.userService.getByLoginFiltred(filter);
		const basicInfos: BasicUserDto[] = [];
		for (let user of users) {
			if (login != user.login)
				basicInfos.push(new BasicUserDto(user.login, user.avatar));
		}
		return basicInfos;
	}

	async markPrivReaded(priv: PrivateEntity) {
		priv.readed = true;
		this.privateRepository.save(priv);
		return priv;
	}

	async printPriv(priv: PrivateEntity) {
		console.log(
			`Priv info :\nusers = ${priv.users[0].login}, ${priv.users[1].login}`,
		);
		console.log('msgs :');
		priv.messages.forEach((msg) => {
			console.log(
				`${msg.message}, created at ${msg.createdAt.toLocaleTimeString('fr')}}`,
			);
		});
	}

	async printPrivs(privs: PrivateEntity[]) {
		privs.forEach(async (priv) => {
			await this.printPriv(priv);
		});
	}

	printPrivDto(priv: PrivConvDto) {
		console.log(`user = ${priv.user.login}`);
		console.log(`readed = ${priv.readed}`);
		priv.messages.forEach((msg) => console.log(`${msg.msg}`));
	}
	
	printPrivsDto(privs: PrivConvDto[]) {
		console.log(`PrintPrivsDto :`);
		if (!privs.length) {
			return console.log(`No privs`);
		}
		privs.forEach((priv : PrivConvDto) => {
			this.printPrivDto(priv);
		});
	}

	// ========================= CHANNELS =========================

	async getUserChans(login: string) {
		const user = await this.userRepository.findOne({
			relations: {
				chansAdmin : {admins: true, users: true, messages: {user: true}},
				chansUser : {admins: true, users: true, messages: {user: true}},
			},
			where: {login: login},
			order: {
				chansAdmin: { messages: { createdAt: 'ASC'} },
				chansUser: { messages: { createdAt: 'ASC'} },
			}
		});
		// if (!user.chansAdmin.length)
		// 	console.log(`chansAdmin.length = 0`);
		// if (!user.chansUser.length)
		// 	console.log(`chansUser.length = 0`);
		// console.log(`chansAdmin =  ${user.chansAdmin}, chansUser =  ${user.chansUser} `)
		// let ret = user.chansAdmin.concat(user.chansUser);
		// console.log(`ret.length = ${ret.length}`);
		// return user.chansAdmin.concat(user.chansUser);
		return user.chansAdmin.concat(user.chansUser);
	}

	async getChan(chanName: string) {
		const chan = await this.channelRepository.findOne({
			where: {name : chanName},
			relations: {
				admins:true,
				users: true,
				bans: true,
				mutes: true,
				messages: {
					user: true,
				},
			},
			order: {
				messages: {
					createdAt: 'ASC',
				},
			},
		});
		return chan;
	}

	async sortChans(chans: ChannelEntity[]) {
		console.log(`Sort Channels`)
		chans.sort(function (x, y) {
			let date1: number;
			let date2: number;
			if (!x.messages.length) {
				date1 = x.createdAt.getTime();
			} else {
				date1 = x.messages.at(-1).createdAt.getTime();
			}
			if (!y.messages.length) {
				date1 = y.createdAt.getTime();
			} else {
				date1 = y.messages.at(-1).createdAt.getTime();
			}
			if ( date1 < date2) 
				return 1;
			return -1;
		});
	}



	createChanDto(chan: ChannelEntity) {
		// console.log(`boucle ${i}`)
		let name = chan.name;
		let psw = chan.password;
		let creation = chan.createdAt;
		let read = chan.readed;
		let avatar = chan.avatar;
		// let admins = chan.admins.map(admin => new BasicUserDto(admin.login));
		let admins : BasicUserDto[] = [];
		chan.admins.forEach(admin => admins.push(new BasicUserDto(admin.login, admin.avatar)));
		let users : BasicUserDto[] = [];
		if (chan.users)
			chan.users.forEach(user => users.push(new BasicUserDto(user.login, user.avatar)));
		let bans : BasicUserDto[] = [];
		if (chan.bans)
			chan.bans.forEach(ban => bans.push(new BasicUserDto(ban.login, ban.avatar)));
		let mutes : BasicUserDto[] = [];
		if (chan.mutes)
			chan.mutes.forEach(mute => mutes.push(new BasicUserDto(mute.login, mute.avatar)));
		let msgs : MessageDto[] = [];
		if (chan.messages)
			chan.messages.forEach((msg) => msgs.push(new MessageDto(msg.user.login, msg.message, msg.createdAt)))
		// console.log(`ChanDto creation :\nname = ${name}, psw = ${psw}`)
		// chansDto.push(new ChannelDto(name, avatar, creation, admins, psw, users, msgs, bans, mutes, read));
		return new ChannelDto(name, avatar, creation, admins, psw, users, msgs, bans, mutes, read);
	}

	createChansDto(requestor: string, chans: ChannelEntity[]) {
		let chansDto : ChannelDto[] = [];
		// this.printChans(chans);
		chans.forEach((chan, i) => {
			// let chandto = this.createChanDto(chan);
			chansDto.push(this.createChanDto(chan));
		});
		// this.printChansDto(chansDto);
		return chansDto;
	}

	async createNewChan(data: NewChanDto) {
		let chanAlreadyExist = await this.channelRepository.findOne({where: {name : data.chanName}});
		console.log(chanAlreadyExist);
		if (chanAlreadyExist){
			throw new HttpException('CHAN_ALREADY_EXIST', HttpStatus.CONFLICT);
		}
		let admin = await this.userService.getByLogin(data.admin);
		let newChan = this.channelRepository.create({name: data.chanName, admins: [admin], password: data.psw});
		this.channelRepository.save(newChan);
		return new ChannelDto(newChan.name, "test", new Date(), [new BasicUserDto(admin.login, admin.avatar)]);
	}

	async addChanMsg(data: NewChanMsgDto) {
		console.log(`addChanMsg Chatservice, msg = '${data.message}'`);
		const userSend = await this.userService.getByLogin(data.userSend);
		const msg = this.msgRepository.create({
			user: userSend,
			message: data.message,
		});
		await this.msgRepository
			.save(msg)
			.catch((e) => console.log('Save msg error'));
		const chan = await this.getChan(data.chanName);
		if (chan) {
			chan.messages.push(msg);
			chan.readed = false;
			await this.channelRepository
				.save(chan)
				.catch((e) => console.log('Save chan error'));
			return chan;
		}
	}

	async getServerChansFiltred(login: string, filter: string) {
		console.log(`getServerChansFiltred for ${login} and filter '${filter}'`)
		let maxUsers = 20;
		const chans = await this.channelRepository.find({
			relations: {
				admins: true,
				users: true,
			},
			where: { name: Like(filter + '%') },
			take: maxUsers,
		});
		const channelTabs: ChannelTabDto[] = [];
		for (let chan of chans) {
			if (!chan.admins.map(a => a.login).includes(login) 
				&& !chan.users.map(u => u.login).includes(login))
				channelTabs.push(new ChannelTabDto(
					chan.name,
					chan.admins.length + chan.users.length,
					chan.password ? true : false,
				))
		}
		return channelTabs;
	}

	async joinChannelReq(
		data: {requestor: string, chanName: string, psw: string | undefined}) 
	{
		let user = await this.userService.getByLogin(data.requestor);
		console.log(`joinChannelReq for chan = ${data.chanName}, user = ${data.requestor}, psw = ${data.psw}`)
		let chan = await this.channelRepository.findOne({
			where: {name: data.chanName},
			relations: {admins: true, users: true, bans: true},
		});
		if (!chan) {
			// server.to(user.socketId).emit("joinChannelError", {error: "CHAN_NOT_FOUND"})
			console.log(`joinChannelReq Error: Chan don't exist`)
			throw new HttpException('CHAN_NOT_FOUND', HttpStatus.NOT_FOUND);
		} else if (data.psw && chan.password != data.psw) {
			// server.to(user.socketId).emit("joinChannelError", {error: "WRONG_PSW"})
			console.log(`joinChannelReq Error: Wrong Password`)
			throw new HttpException('WRONG_PSW', HttpStatus.BAD_REQUEST);
		} else if (chan.bans.includes(user)) {
			// server.to(user.socketId).emit("joinChannelError", {error: "USER_BANNDED"})
			console.log(`joinChannelReq Error: User Banned`)
			throw new HttpException('USER_BANNDED', HttpStatus.UNAUTHORIZED);
		} else {
			chan.users.push(user);
			this.channelRepository.save(chan).catch((e) => console.log('Save chan error'));
			return this.createChanDto(chan);
		}
	}

	async newChannelUser(
		server: Server,
		data: {requestor: string, chanName: string}) 
	{
		let user = await this.userService.getByLogin(data.requestor);
		let chan = await this.channelRepository.findOne({
			where: {name: data.chanName},
			relations: {admins: true, users: true},
		});
		// console.log(`server = ${this.server}`);
		for (let user of chan.admins.concat(chan.users))
			server.to(user.socketId).emit("newChannelUser", {
				name: chan.name,
				user: new BasicUserDto(user.login, user.avatar),
			});
	}


	printChanDto(chan: ChannelDto) {
		console.log(`psw = ${chan.psw}`);
		console.log(`creation = ${chan.creation}`);
		console.log(`readed = ${chan.readed}`);
		// console.log(` admins = ${chan.admins.map(admin => admin.login + ', ')}`);
		chan.admins.forEach((elem) => console.log(`${elem.login}`));
		// chan.admins.forEach((elem) => console.log(`${elem.login}`));
		
	
		chan.messages.forEach((msg) => console.log(`${msg.msg}`));
	}
	
	printChansDto(chans: ChannelDto[]) {
		console.log(`PrintChansDto :`);
		if (!chans.length) {
			return console.log(`No channels`);
		}
		chans.forEach((chan : ChannelDto) => {
			console.log(`PrintChanDto : ${chan.name}`);
			this.printChanDto(chan);
		});
	}

	async printChan(chan: ChannelEntity) {
		console.log(`Chan info :`);
		console.log(`name : ${chan.name}`);
		console.log(`admins : ${chan.admins.map(admin => admin.login + ', ')}`);
		console.log(`users : ${chan.users.map(user => user.login + ', ')}`);
		console.log("msgs :");
		chan.messages.forEach(msg => {
			console.log(`${msg.message}, created at ${msg.createdAt.toLocaleTimeString("fr")}`)
		})
	}

	async printChans(chans: ChannelEntity[]) {
		console.log(`printChans()`)
		if (!chans.length) {
			return console.log(`No channels`);
		}
		chans.forEach(async (chan) => {
			await this.printChan(chan);
		});
	}

}
