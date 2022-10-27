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
import { group, timeStamp } from 'console';
import { NewChanDto } from './dto/NewChanDto';
import { ChannelTabDto } from './dto/ChannelTabDto ';
import { ModifChanDto } from './dto/ModifChanDto';
import { MetadataScanner } from '@nestjs/core';
import e from 'express';

class timerData {
	chan: string;
	login: string;
	id: number;
	constructor(chan:string, login:string, id:number) {
		this.chan = chan;
		this.login = login;
		this.id = id;
	}
}

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

		// private idIntervals : timerData[] = [],
	) {}

	@WebSocketServer() server: Server;

	// ========================= PRIVATES =========================

	async getUserPrivs(login: string) {
		const user = await this.userRepository.findOne({
			relations: { 
				blockeds: true, 
				privates: { users: true, messages: { user: true } } 
			},
			where: { login: login },
			order: {
				privates: {
					messages: {
						createdAt: 'ASC',
					},
				},
			},
		});
		let privs = user.privates.filter(p => !user.blockeds.map(b => b.login)
			.some(b => p.users.map(u => u.login).includes(b)));
		return privs;
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
		const userSend = await this.userService.getByLogin(data.userSend);
		const userReceive = await this.userService.getByLogin(data.userReceive);
		const msg = this.msgRepository.create({
			user: userSend,
			message: data.message,
		});
		await this.msgRepository
			.save(msg)
			.catch((e) => console.log('Save msg error'));
		const priv = await this.getPriv([data.userSend, data.userReceive]);
		if (priv) {
			priv.messages.push(msg);
			priv.readed = false;
			await this.privateRepository
				.save(priv)
				.catch((e) => console.log('Save priv error'));
			return priv;
		}
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
		let requestor = await this.userService.getByLogin(login, {blockeds : true});
		let users = (await this.userService.getByLoginFiltred(filter))
			.filter(u => u.login != login)
			.filter(u => !requestor.blockeds.map(b => b.login).includes(u.login))
		// const basicInfos: BasicUserDto[] = [];
		// for (let user of users) {
		// 	if (login != user.login)
		// 		basicInfos.push(new BasicUserDto(user.login, user.avatar));
		// }
		// return basicInfos;
		return users.map(u => new BasicUserDto(u.login, u.avatar))
	}

	// async markPrivReaded(priv: PrivateEntity) {
	async markPrivReaded(sender: string, receiver: string) {
		console.log(`sender '${sender}' read private of '${receiver}'`);
		let priv = await this.getPriv([sender, receiver]);
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
		const ownChans = await this.userRepository.findOne({
			relations: {
				chansOwner : {owner: true, admins: true, users: true, 
					mutes: true, bans: true, messages: {user: true}},
			},
			where: {login: login},
			order: {
				chansOwner: { messages: { createdAt: 'ASC'} },
			}
		});
		const admChans = await this.userRepository.findOne({
			relations: {
				chansAdmin : {owner: true, admins: true, users: true, 
					mutes: true, bans: true, messages: {user: true}},
			},
			where: {login: login},
			order: {
				chansAdmin: { messages: { createdAt: 'ASC'} },
			}
		});
		const userChans = await this.userRepository.findOne({
			relations: {
				chansUser : {owner: true, admins: true, users: true, 
					mutes: true, bans: true, messages: {user: true}},
			},
			where: {login: login},
			order: {
				chansUser: { messages: { createdAt: 'ASC'} },
			}
		});
		const muteChans = await this.userRepository.findOne({
			relations: {
				chansMute : {owner: true, admins: true, users: true, 
					mutes: true, bans: true, messages: {user: true}},
			},
			where: {login: login},
			order: {
				chansMute: { messages: { createdAt: 'ASC'} },
			}
		});
		return ownChans.chansOwner
			.concat(admChans.chansAdmin)
			.concat(userChans.chansUser)
			.concat(muteChans.chansMute);
	}

	async getChan(chanName: string) {
		const chan = await this.channelRepository.findOne({
			where: {name : chanName},
			relations: {
				owner: true,
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

	sortChans(chans: ChannelDto[]) {
		chans.sort(function (x, y) {
			let date1: number;
			let date2: number;
			if (!x.messages.length) {
				date1 = x.creation.getTime();
			} else {
				date1 = x.messages.at(-1).date.getTime();
			}
			if (!y.messages.length) {
				date2 = y.creation.getTime();
			} else {
				date2 = y.messages.at(-1).date.getTime();
			}
			if ( date1 < date2) 
				return 1;
			return -1;
		});
	}

	createChanDto(chan: ChannelEntity) {
		let name = chan.name;
		let psw = chan.password;
		let creation = chan.createdAt;
		let owner;
		chan.owner ? owner = new BasicUserDto(chan.owner.login, chan.owner.avatar)
			: owner = null;
		let priv = chan.private;
		let read = true;
		let avatar = chan.avatar;
		let admins : BasicUserDto[] = [];
		chan.admins?.forEach(admin => admins
			.push(new BasicUserDto(admin.login, admin.avatar)));
		let users : BasicUserDto[] = [];
		chan.users?.forEach(user => users
			.push(new BasicUserDto(user.login, user.avatar)));
		let bans : BasicUserDto[] = [];
		chan.bans?.forEach(ban => bans
			.push(new BasicUserDto(ban.login, ban.avatar)));
		let mutes : BasicUserDto[] = [];
		chan.mutes?.forEach(mute => mutes
			.push(new BasicUserDto(mute.login, mute.avatar)));
		let msgs : MessageDto[] = [];
		chan.messages?.forEach((msg) => msgs
			.push(new MessageDto(msg.user.login, msg.message, msg.createdAt)))
		// let ret =  new ChannelDto(name, avatar, creation, admins, psw, users, msgs, bans, mutes, read);
		// this.printChanDto(ret);
		// return ret;
		return new ChannelDto(name, avatar, creation, owner, 
			priv, psw, admins, users, msgs, bans, mutes, read);
	}

	createChansDto(requestor: string, chans: ChannelEntity[]) {
		let chansDto : ChannelDto[] = [];
		chans.forEach((chan, i) => {
			chansDto.push(this.createChanDto(chan));
		});
		return chansDto;
	}

	async createNewChan(data: NewChanDto) {
		let chanAlreadyExist = await this.channelRepository
			.findOne({where: {name : data.chanName}});
		if (chanAlreadyExist)
			throw new HttpException('CHAN_ALREADY_EXIST', HttpStatus.CONFLICT);
		let owner = await this.userService.getByLogin(data.admin);
		let newChan = this.channelRepository
			.create({name: data.chanName, private: data.priv,
			owner: owner, password: data.psw}); 
		await this.channelRepository.save(newChan)
			.catch((e) => console.log('Save channel error'));
		return this.createChanDto(newChan);
		// return new ChannelDto(newChan.name, "test", newChan.createdAt, 
		// 	new BasicUserDto(owner.login, owner.avatar), newChan.private , data.psw);
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
			// chan.readed = false;
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
				owner: true,
				admins: true,
				users: true,
				mutes: true,
			},
			where: { name: Like(filter + '%'), private: false },
			take: maxUsers,
		});
		const channelTabs: ChannelTabDto[] = [];
		for (let chan of chans) {
			if (!chan.admins.map(a => a.login).includes(login) 
				&& !chan.users.map(u => u.login).includes(login)
				&& !chan.mutes.map(m => m.login).includes(login))
				channelTabs.push(new ChannelTabDto(
					chan.name,
					chan.admins.length + chan.users.length
						+ (chan.owner? 1 : 0),
					chan.password ? true : false,
				))
		}
		return channelTabs;
	}

	async joinChanRequest(
		data: {requestor: string, chanName: string, psw: string | undefined}) 
	{
		let user = await this.userService.getByLogin(data.requestor);
		console.log(`joinChanRequest for chan = ${data.chanName}, user = ${data.requestor}, psw = ${data.psw}`)
		let chan = await this.channelRepository.findOne({
			where: {name: data.chanName},
			relations: {
				owner: true,
				admins: true, 
				users: true, 
				mutes:true,  
				bans: true, 
				messages: { user: true}},
		});
		if (!chan) {
			console.log(`joinChanRequest Error: Chan don't exist`)
			throw new HttpException('CHAN_NOT_FOUND', HttpStatus.NOT_FOUND);
		} else if (data.psw && chan.password != data.psw) {
			console.log(`joinChanRequest Error: Wrong Password`)
			throw new HttpException('WRONG_PSW', HttpStatus.BAD_REQUEST);
		} else if (chan.bans.findIndex(ban => ban.login == data.requestor) != -1) {
			console.log(`joinChanRequest Error: User Banned`)
			throw new HttpException('USER_BANNDED', HttpStatus.UNAUTHORIZED);
		} else {
			console.log(`user '${user.login}' join chanel '${chan.name}'`)
			chan.users.push(user);
			await this.channelRepository.save(chan)
				.catch((e) => console.log('Save chan error'));
			console.log(`chan.owner = ${chan.owner.login}`);
			return this.createChanDto(chan);
		}
	}

	async userExistOrBlocked (login: string, requestor : string) {
		if (login == requestor)
			throw new HttpException('IS_YOU', HttpStatus.BAD_REQUEST);
		let user = await this.userRepository.findOne({
			where: {login: login}
		});
		if (!user)
			throw new HttpException('DO_NOT_EXIST', HttpStatus.NOT_FOUND);
		let asker = await this.userRepository.findOne({
			where: {login: requestor}, relations: {blockeds: true},
		});
		if (asker.blockeds.map(b => b.login).includes(login))
			throw new HttpException('USER_BLOCKED', HttpStatus.BAD_REQUEST);
		else
			return new BasicUserDto(user.login, user.avatar);
	}

	async chanExist (chanName: string) {
		console.log(`verify if channel '${chanName}' exist`)
		let chan = await this.channelRepository.findOne({
			where: {name: chanName}
		});
		if (chan)
			return true;
		else
			return false;
	}

	async invitChanUser(chanName: string, login: string) {
		let user = await this.userRepository.findOne({
			where: {login: login},
		})
		if (!user)
			throw new HttpException('DO_NOT_EXIST', HttpStatus.NOT_FOUND);
		let chan = await this.channelRepository.findOne({
			where: {name: chanName},
			relations: {
				owner: true,
				admins: true, 
				users: true, 
				mutes: true,
				bans:true,
			}
		});
		let allUsers = chan.admins.concat(chan.users).concat(chan.mutes);
		if (chan.owner)
			allUsers.push(chan.owner);
		let isUser = allUsers.find(user => user.login == login)
		if (isUser)
			throw new HttpException('ALREADY_USER', HttpStatus.CONFLICT);
		let banned = chan.bans.find(user => user.login == login)
		if (banned)
			throw new HttpException('IS_BANNED', HttpStatus.UNAUTHORIZED);
		return true;
	}

	async newChannelUser(
		server: Server,
		data: {chan: string, login: string}) 
	{
		console.log(`newUser '${data.login}' want to join '${data.chan}'`)
		let newUser = await this.userService.getByLogin(data.login);
		let chan = await this.channelRepository.findOne({
			where: {name: data.chan},
			relations: {
				owner: true,
				admins: true, 
				users: true, 
				mutes: true,
				bans:true, 
				messages: {user:true}},
		});
		if (!chan.users.map(user => user.login).includes(data.login)) {
			chan.users.push(newUser);
			this.channelRepository.save(chan)
				.catch((e) => console.log('Save chan error'));
		}
		server.to(newUser.socketId).emit("newChannel", this.createChanDto(chan));
		let allUsers = chan.admins.concat(chan.users).concat(chan.mutes);
		if (chan.owner)
			allUsers.push(chan.owner)
		for (let user of allUsers) {
			if (user.login != newUser.login)
				server.to(user.socketId).emit("newChannelUser", {
					name: chan.name,
					user: new BasicUserDto(newUser.login, newUser.avatar),
				});
		}
	}

	async userQuitChan(
		server: Server,
		data: {login: string, chan: string}) 
	{
		console.log(`User '${data.login}' left the channel '${data.chan}'`);
		let chan = await this.channelRepository.findOne({
			where: {name: data.chan},
			relations: {
				owner: true, 
				admins: true, 
				users: true, 
				mutes: true
			},
		});
		let i;
		if (chan.owner && data.login == chan.owner.login)
			chan.owner = null;
		else if ((i = chan.admins.findIndex(u => u.login == data.login)) != -1)
			chan.admins.splice(i, 1);
		else if ((i = chan.users.findIndex(u => u.login == data.login)) != -1)
			chan.users.splice(i, 1);
		else if ((i = chan.mutes.findIndex(u => u.login == data.login)) != -1)
			chan.mutes.splice(i, 1);
		if ((chan.owner ? 1 : 0) +
			chan.admins.length + chan.users.length + chan.mutes.length == 0)
			this.channelRepository.remove(chan)
			.catch((e) => console.log('Remove chan error'));
		else
			this.channelRepository.save(chan)
			.catch((e) => console.log('Save chan error'));
		let allUsers = chan.admins.concat(chan.users).concat(chan.mutes);
		if (chan.owner)
			allUsers.push(chan.owner);
		for (let user of allUsers) {			
			if (user.login != data.login)
				server.to(user.socketId).emit("userQuitChan", {
					login: data.login,
					chan: data.chan,
				});
		}
	}


	isOwner(user: UserEntity, chan: ChannelEntity) {
		if (chan.owner && chan.owner.login == user.login)
			return true;
		return false;
	}

	isAdm(user: UserEntity, chan: ChannelEntity) {
		return chan.admins.map(a => a.login).includes(user.login);
	}

	async modifChan(server: Server, modif: ModifChanDto) {
		let requestor = await this.userService.getByLogin(modif.requestor);
		let chan = await this.channelRepository.findOne({
			where: {name: modif.chan},
			relations: {owner: true, admins: true, users: true,
				mutes: true, bans: true, messages: true},
		});
		if (!this.isOwner(requestor, chan) && !this.isAdm(requestor, chan))
			throw new HttpException('NOT_OWNER_OR_ADMIN', HttpStatus.BAD_REQUEST);
		await this.updateChanSetting(chan, modif, server);
		let allUsers = chan.admins.concat(chan.users)
			.concat(chan.mutes).concat(chan.bans);
		if (chan.owner)
			allUsers.push(chan.owner);
		for (let user of allUsers)
			server.to(user.socketId).emit("modifChan", modif);
	}

	async updateChanSetting(chan: ChannelEntity, modif: ModifChanDto, server: Server) {
		if (modif.psw != undefined) {
			console.log(`Modif chan psw : ${modif.psw == "" ? "no psw" : modif.psw}`)
			modif.psw == "" ?
				chan.password = null : chan.password = modif.psw; 
		}
		else if (modif.priv != undefined) {
			console.log(`Modif chan '${modif.chan}' : private = ${modif.priv}`)
			chan.private = modif.priv;
		}
		else if (modif.promotAdm) {
			console.log(`Modif chan promotAdm : chan = ${modif.chan}, newAdm = ${modif.promotAdm}`)
			let i = chan.users.findIndex(user => user.login == modif.promotAdm);
			chan.admins.push(chan.users[i]);
			chan.users.splice(i, 1);
		}
		else if (modif.demotUser){
			console.log(`Modif chan demotUser : chan = ${modif.chan}, newUser = ${modif.demotUser}`)
			let i = chan.admins.findIndex(user => user.login == modif.demotUser);
			chan.users.push(chan.admins[i]);
			chan.admins.splice(i, 1);
		}
		else if (modif.mute) {
			console.log(`User '${modif.mute}' from group '${modif.group}' of chan '${modif.chan}' is muted`);
			let i = (chan[modif.group as keyof ChannelEntity] as UserEntity[])
			.findIndex(user => user.login == modif.mute);
			chan.mutes.push((chan[modif.group as keyof ChannelEntity] as UserEntity[])[i]);
			(chan[modif.group as keyof ChannelEntity] as UserEntity[]).splice(i, 1);
			this.muteBanTimer(chan, modif, server);
		}
		else if (modif.restoreMute) {
			console.log(`User '${modif.restoreMute}' from chan '${modif.chan}' is unmuted`);
			let i = chan.mutes.findIndex(mute => mute.login == modif.restoreMute);
			chan.users.push(chan.mutes[i]);
			chan.mutes.splice(i, 1);
		}
		else if (modif.kick) {
			console.log(`User '${modif.kick}' from group '${modif.group}' of chan '${modif.chan}' is kicked`);
			let kicked = await this.userService.getByLogin(modif.kick);
			let i = (chan[modif.group as keyof ChannelEntity] as UserEntity[])
				.findIndex(user => user.login == modif.ban);
			(chan[modif.group as keyof ChannelEntity] as UserEntity[]).splice(i, 1);
			server.to(kicked.socketId).emit("modifChan", modif);
		}
		else if (modif.ban) {
			console.log(`User '${modif.ban}' from group '${modif.group}' of chan '${modif.chan}' is baned`);
			let i = (chan[modif.group as keyof ChannelEntity] as UserEntity[])
				.findIndex(user => user.login == modif.ban);
			chan.bans.push((chan[modif.group as keyof ChannelEntity] as UserEntity[])[i]);
			(chan[modif.group as keyof ChannelEntity] as UserEntity[]).splice(i, 1);
			this.muteBanTimer(chan, modif, server);
		}
		else if (modif.restoreBan) {
			let i = chan.mutes.findIndex(mute => mute.login == modif.restoreBan);
			chan.bans.splice(i, 1);
		}
		// else if (modif.avatar)
		// 	return modifChanAvatar(server, modif.chan, modif.avatar);
		this.channelRepository.save(chan)
			.catch((e) => console.log('Save Channel error'));
	}

	muteBanTimer(chan: ChannelEntity, modif: ModifChanDto, server: Server) {
		let seconds = 0;
		let idInterval = setInterval(() => {
			seconds += 1;
			console.log(`seconds = ${seconds}, limit = ${modif.time}`); 
			if (seconds >= modif.time) {
				clearInterval(idInterval);
				let login: string;
				let restore: string;
				if (modif.mute) {
					if (chan.mutes.findIndex(mute => mute.login == modif.mute) == -1)
						return console.log(`User '${modif.mute}' already unmuted`);
					login = modif.mute;
					restore = "unmuted";
					modif.restoreMute = modif.mute;
					modif.mute = undefined;
					let i = chan.mutes.findIndex(mute => mute.login == login);
					chan.users.push(chan.mutes[i]);
					chan.mutes.splice(i, 1);
				}
				else {
					if (chan.bans.findIndex(ban => ban.login == modif.ban) == -1)
						return console.log(`User '${modif.ban}' already unbaned`);
					login = modif.ban;
					restore = "unbaned";
					modif.restoreBan = modif.ban;
					modif.ban = undefined;
					let i = chan.bans.findIndex(ban => ban.login == login);
					chan.bans.splice(i, 1);
				}
				this.channelRepository.save(chan)
					.catch((e) => console.log('Save Channel error'));
				console.log(`User '${login}' from channel '${chan.name}' is restored`);
				let allUsers = chan.admins.concat(chan.users).concat(chan.mutes);
				if (chan.owner)
					allUsers.push(chan.owner);
				for (let user of allUsers) {	
					server.to(user.socketId).emit("modifChan", modif);
				}
			}
		}, 1000);
	}

	async blockUser(data : {blocker: string, blocked: string}) {
		console.log(`User '${data.blocker}' block '${data.blocked}'`);
		let blocker = await this.userService.getByLogin(data.blocker, {blockeds: true});
		let blocked = await this.userService.getByLogin(data.blocked);
		blocker.blockeds.push(blocked);
		await this.userRepository.save(blocker)
			.catch((e) => console.log('Save User error'));
		return blocked;
	}

	async unblockUser(data : {blocker: string, blocked: string}, server: Server) {
		console.log(`User '${data.blocker}' unblock '${data.blocked}'`);
		let blocker = await this.userService.getByLogin(data.blocker, {blockeds: true});
		let i = blocker.blockeds.findIndex(b => b.login == data.blocked)
		blocker.blockeds.splice(i, 1);
		await this.userRepository.save(blocker)
			.catch((e) => console.log('Save User error'));
		let priv = await this.getPriv([data.blocked,data.blocker]);
		let basicUser = (priv.users[0].login == data.blocker ? 
			new BasicUserDto(priv.users[1].login, priv.users[1].avatar)
			: new BasicUserDto(priv.users[0].login, priv.users[0].avatar))
		let msgs = priv.messages
			.map(m => new MessageDto(m.user.login, m.message, m.createdAt));
		let privDto = new PrivConvDto(basicUser, msgs, priv.readed, priv.id);
		server.to(blocker.socketId).emit('userUnblock', privDto);
	}
	
	printChanDto(chan: ChannelDto) {
		console.log(`psw = ${chan.psw}`);
		console.log(`creation = ${chan.creation}`);
		console.log(`readed = ${chan.readed}`);
		console.log(`admins = ${chan.admins.map(admin => admin.login + ', ')}`);
		console.log(`users = ${chan.users.map(user => user.login + ', ')}`);
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
		console.log(`mutes : ${chan.mutes.map(mute => `'` + mute.login + `'`)}`);
		console.log(`bans : ${chan.bans.map(ban => ban.login + ', ')}`);
		console.log(`msgs : ${chan.messages.map(msg => `'` + msg.message + `'`)}`);
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
