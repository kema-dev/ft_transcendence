/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from 'socket.io';
import { WebSocketServer} from '@nestjs/websockets';
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
import { NewChanDto } from './dto/NewChanDto';
import { ChannelTabDto } from './dto/ChannelTabDto ';
import { ModifChanDto } from './dto/ModifChanDto';
import { SanctionEntity } from './entites/sanction.entity';
import { type } from 'os';


@Injectable()
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
		@InjectRepository(SanctionEntity)
		private sanctionRepository: Repository<SanctionEntity>,
		private readonly userService: UsersService,
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

	async addPrivMsg(userSend: UserEntity, data: NewPrivMsgDto) {
		console.log(`addPrivMsg Chatservice, msg = '${data.message}'`);
		const userReceive = await this.userService.getByLogin(data.userReceive);
		if (!userReceive) {
			console.log(`AddPrivMsg error: User '${data.userReceive}' not found"`);
			return null;
		}
		const msg = this.msgRepository.create({
			user: userSend,
			message: data.message,
		});
		await this.msgRepository
			.save(msg)
			.catch((e) => console.log('Save msg error'));
		const priv = await this.getPriv([userSend.login, data.userReceive]);
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
		return users.map(u => new BasicUserDto(u.login, u.avatar))
	}

	async markPrivReaded(sender: string, receiver: string) {
		let priv = await this.getPriv([sender, receiver]);
		if (!priv) {
			console.log(`markPrivReaded error: Private conv not found"`);
			return;
		}
		console.log(`sender '${sender}' read private of '${receiver}'`);
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
					sanctions: {user: true}, messages: {user: true}},
			},
			where: {login: login},
			order: {
				chansOwner: { messages: { createdAt: 'ASC'} },
			}
		});
		const admChans = await this.userRepository.findOne({
			relations: {
				chansAdmin : {owner: true, admins: true, users: true, 
					sanctions: {user: true}, messages: {user: true}},
			},
			where: {login: login},
			order: {
				chansAdmin: { messages: { createdAt: 'ASC'} },
			}
		});
		const userChans = await this.userRepository.findOne({
			relations: {
				chansUser : {owner: true, admins: true, users: true, 
					sanctions: {user: true}, messages: {user: true}},
			},
			where: {login: login},
			order: {
				chansUser: { messages: { createdAt: 'ASC'} },
			}
		});
		const sanctions = await this.sanctionRepository.find({
			relations: {
				user: true,
				chan : {
					owner: true, admins: true, users: true, 
					sanctions: {user: true}, messages: {user: true}
				}
			},
			where: {
				user: {
					login: login
				},
				type: 'mute',
			},
			order: {
				chan: { messages: { createdAt: 'ASC'} },
			}
		});
		let sanctionChans = sanctions.map(s => s.chan);
		return ownChans.chansOwner
			.concat(admChans.chansAdmin)
			.concat(userChans.chansUser)
			.concat(sanctionChans);
	}

	async getChan(chanName: string) {
		const chan = await this.channelRepository.findOne({
			where: {name : chanName},
			relations: {
				owner: true,
				admins:true,
				users: true,
				sanctions: {
					user: true,
				},
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
		let mutes : BasicUserDto[] = [];
		chan.sanctions?.forEach(s => {
			if (s.type == 'ban')
				bans.push(new BasicUserDto(s.user.login, s.user.avatar));
			else if (s.type == 'mute')
				mutes.push(new BasicUserDto(s.user.login, s.user.avatar));
		})
		let msgs : MessageDto[] = [];
		chan.messages?.forEach((msg) => msgs
			.push(new MessageDto(msg.user.login, msg.message, msg.createdAt)))
		return new ChannelDto(name, avatar, creation, owner, 
			priv, psw, admins, users, msgs, bans, mutes, read);
	}

	createChansDto(chans: ChannelEntity[]) {
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
	}

	async addChanMsg(userSend : UserEntity, data: NewChanMsgDto) {
		console.log(`addChanMsg Chatservice,chan = ${data.chanName}, msg = '${data.message}'`);
		const chan = await this.getChan(data.chanName);
		if (!chan) {
			console.log(`addChanMsg error : Channel'${data.chanName} not found'`);
			return null;
		}
		const msg = this.msgRepository.create({
			user: userSend,
			message: data.message,
		});
		await this.msgRepository
			.save(msg)
			.catch((e) => console.log('Save msg error'));
		chan.messages.push(msg);
		await this.channelRepository
			.save(chan)
			.catch((e) => console.log('Save chan error'));
		return chan;
	}

	async getServerChansFiltred(login: string, filter: string) {
		console.log(`getServerChansFiltred for '${login}' and filter '${filter}'`)
		let maxUsers = 20;
		const chans = await this.channelRepository.find({
			relations: {
				owner: true,
				admins: true,
				users: true,
				sanctions: {
					user: true,
				}
			},
			where: { name: Like(filter + '%'), private: false },
			take: maxUsers,
		});
		const channelTabs: ChannelTabDto[] = [];
		for (let chan of chans) {
			if (
				chan.owner.login != login
				&& !chan.admins.map(a => a.login).includes(login) 
				&& !chan.users.map(u => u.login).includes(login)
				&& !chan.sanctions.filter(s => s.type == 'mute')
					.map(s => s.user.login).includes(login)
			) {
				channelTabs.push(new ChannelTabDto(
					chan.name,
					chan.admins.length + chan.users.length
						+ (chan.owner? 1 : 0),
					chan.password ? true : false,
				))
			}
		}
		return channelTabs;
	}

	async joinChanRequest(
		data: {requestor: string, chanName: string, psw: string | undefined}) 
	{
		let user = await this.userService.getByLogin(data.requestor);
		console.log(`joinChanRequest for chan = ${data.chanName}, user = ${data.requestor}, psw = ${data.psw}`)
		let chan = await this.getChan(data.chanName);
		if (!chan) {
			console.log(`joinChanRequest Error: Chan don't exist`)
			throw new HttpException('CHAN_NOT_FOUND', HttpStatus.NOT_FOUND);
		} else if (data.psw && chan.password != data.psw) {
			console.log(`joinChanRequest Error: Wrong Password`)
			throw new HttpException('WRONG_PSW', HttpStatus.BAD_REQUEST);
		} else if (
				chan.sanctions.filter(s => s.type == 'ban')
					.findIndex(s => s.user.login == data.requestor) != -1
			) {
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
		let chan = await this.getChan(chanName);
		let allUsers = this.getAllChanUsers(chan);
		let isUser = allUsers.find(user => user.login == login)
		if (isUser)
			throw new HttpException('ALREADY_USER', HttpStatus.CONFLICT);
		let banned = chan.sanctions.filter(s => s.type == 'ban')
			.find(sanction => sanction.user.login == login)
		if (banned)
			throw new HttpException('IS_BANNED', HttpStatus.UNAUTHORIZED);
		return true;
	}

	async newChannelUser(
		server: Server,
		data: {chan: string, login: string}) 
	{
		let newUser = await this.userService.getByLogin(data.login);
		if (!newUser) {
			console.log(`newChannelUser error : User not found'`);
			return;
		}
		let chan = await this.getChan(data.chan);
		if (!chan) {
			console.log(`newChannelUser error : Channel not found'`);
			return;
		}
		console.log(`newUser '${data.login}' want to join '${data.chan}'`)
		if (!chan.users.map(user => user.login).includes(data.login)) {
			chan.users.push(newUser);
			this.channelRepository.save(chan)
				.catch((e) => console.log('Save chan error'));
		}
		server.to(newUser.socketId).emit("newChannel", this.createChanDto(chan));
		let allUsers = this.getAllChanUsers(chan);
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
		login: string, chanName: string
	){
		let chan = await this.getChan(chanName);
		if (!chan) {
			console.log(`UserQuitChan error: Chan '${chanName} not found'`);
			return;
		}
		console.log(`User '${login}' left the channel '${chan}'`);
		let i;
		if (chan.owner && login == chan.owner.login)
			chan.owner = null;
		else if ((i = chan.admins.findIndex(u => u.login == login)) != -1)
			chan.admins.splice(i, 1);
		else if ((i = chan.users.findIndex(u => u.login == login)) != -1)
			chan.users.splice(i, 1);
		else if (
			(i = chan.sanctions.filter(s => s.type == 'mute')
				.findIndex(s => s.user.login == login)) != -1
		)
			this.removeSanction(chan, login, 'mute');
		if (
			(chan.owner ? 1 : 0) + chan.admins.length + chan.users.length 
				+ chan.sanctions.filter(s => s.type == 'mute').length == 0
		)
			this.channelRepository.remove(chan)
			.catch((e) => console.log('Remove chan error'));
		else
			this.channelRepository.save(chan)
			.catch((e) => console.log('Save chan error'));
		let allUsers = this.getAllChanUsers(chan);
		for (let user of allUsers) {
			if (user.login != login) {
				console.log(`send to ${user.login}`)			
				server.to(user.socketId).emit("userQuitChan", {
					login: login,
					chan: chan.name,
				});
			}
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

	async modifChan(server: Server, requestor: UserEntity, modif: ModifChanDto) {
		// let requestor = await this.userService.getByLogin(modif.requestor);
		let chan = await this.getChan(modif.chan);
		if (!chan) {
			console.log(`modifChan error: Chan '${modif.chan} not found'`);
			return;
		}
		if (!this.isOwner(requestor, chan) && !this.isAdm(requestor, chan))
			throw new HttpException('NOT_OWNER_OR_ADMIN', HttpStatus.BAD_REQUEST);
		if (await this.updateChanSetting(chan, modif, server) == 1) {
			let allUsers = this.getAllChanUsers(chan, true);
			for (let user of allUsers)
				server.to(user.socketId).emit("modifChan", modif);
		}
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
			let i = chan.users.findIndex(user => user.login == modif.promotAdm);
			if (i == -1) {
				console.log(`updateChanSetting error: promotAdm ${modif.promotAdm} not found in users`);
				return 0;
			}
			console.log(`Modif chan promotAdm : chan = ${modif.chan}, newAdm = ${modif.promotAdm}`)
			chan.admins.push(chan.users[i]);
			chan.users.splice(i, 1);
		}
		else if (modif.demotUser){
			let i = chan.admins.findIndex(user => user.login == modif.demotUser);
			if (i == -1) {
				console.log(`updateChanSetting error: demotUser ${modif.demotUser} not found in admins`);
				return 0;
			}
			console.log(`Modif chan demotUser : chan = ${modif.chan}, newUser = ${modif.demotUser}`)
			chan.users.push(chan.admins[i]);
			chan.admins.splice(i, 1);
		}
		else if (modif.mute) {
			if (modif.group != 'admins' && modif.group != 'users') {
				console.log(`updateChanSetting error: modif.group '${modif.group}' not correct`);
				return 0;
			}
			if (modif.group == 'admins') {
				let i = chan.admins.findIndex(u => u.login == modif.mute);
				if (i == -1) {
					console.log(`updateChanSetting error: User muted ${modif.mute} not found in admins`);
					return 0;
				}
				chan.admins.splice(i, 1);
			}
			else if (modif.group == 'users') {
				let i = chan.users.findIndex(u => u.login == modif.mute);
				if (i == -1) {
					console.log(`updateChanSetting error: User muted ${modif.mute} not found in users`);
					return 0;
				}
				chan.users.splice(i, 1);
			}
			console.log(`User '${modif.mute}' from group '${modif.group}' of chan '${modif.chan}' is muted`);
			if (await this.addSanction(chan, modif.mute, 'mute', modif.time) == 0)
				return 0;
		}
		else if (modif.restoreMute) {
			let user = chan.sanctions.filter(s => s.type == 'mute')
				.find(s => s.user.login == modif.restoreMute).user;
			if (!user) {
				console.log(`updateChanSetting error: User restoreMute ${modif.restoreMute} not found in mutes`);
				return 0;
			}
			console.log(`User '${modif.restoreMute}' from chan '${modif.chan}' is unmuted`);
			chan.users.push(user);
			return await this.removeSanction(chan, modif.restoreMute, 'mute')
		}
		else if (modif.kick) { 
			if (
				modif.group != 'admins' && modif.group != 'users'
				&& modif.group != 'mutes' && modif.group != 'bans'
			) {
				console.log(`updateChanSetting error: modif.group '${modif.group}' not correct`);
				return 0;
			}
			let kicked = await this.userService.getByLogin(modif.kick);
			if (!kicked) {
				console.log(`updateChanSetting error: User kicked ${modif.kick} not found`);
				return 0;
			}
			if (modif.group == 'admins') {
				let i = chan.admins.findIndex(u => u.login == modif.kick);
				if (i == -1) {
					console.log(`updateChanSetting error: User kicked ${modif.kick} not found in admins`);
					return 0;
				}
				chan.admins.splice(i, 1);
			}
			else if (modif.group == 'users') {
				let i = chan.users.findIndex(u => u.login == modif.kick);
				if (i == -1) {
					console.log(`updateChanSetting error: User kicked ${modif.kick} not found in users`);
					return 0;
				}
				chan.users.splice(i, 1);
			}
			else if (modif.group == 'mutes') {
				if (await this.removeSanction(chan, modif.kick, 'mute') == 0)
					return 0;
			}
			else if (modif.group == 'bans') {
				if (await this.removeSanction(chan, modif.kick, 'ban') == 0)
					return 0;
			}
			console.log(`User '${modif.kick}' from group '${modif.group}' of chan '${modif.chan}' is kicked`);
			if (modif.group != 'bans')
				server.to(kicked.socketId).emit("modifChan", modif);
		}
		else if (modif.ban) {
			if (modif.group != 'admins' && modif.group != 'users' && modif.group != 'mutes') {
				console.log(`updateChanSetting error: modif.group '${modif.group}' not correct`);
				return 0;
			}
			if (modif.group == 'admins') {
				let i = chan.admins.findIndex(u => u.login == modif.ban);
				if (i == -1) {
					console.log(`updateChanSetting error: User ban ${modif.ban} not found in admins`);
					return 0;
				}
				chan.admins.splice(i, 1);
			}
			else if (modif.group == 'users') {
				let i = chan.users.findIndex(u => u.login == modif.ban);
				if (i == -1) {
					console.log(`updateChanSetting error: User ban ${modif.ban} not found in users`);
					return 0;
				}
				chan.users.splice(i, 1);
			}
			else if (modif.group == 'mutes') {
				if (await this.removeSanction(chan, modif.ban, 'mute') == 0)
					return 0;
			}
			if (await this.addSanction(chan, modif.ban, 'ban', modif.time) == 0)
				return 0;
			console.log(`User '${modif.ban}' from group '${modif.group}' of chan '${modif.chan}' is baned`);
		}
		else if (modif.restoreBan) {
			console.log(`User '${modif.restoreBan}' from chan '${modif.chan}' is unbanned`);
			return this.removeSanction(chan, modif.restoreBan, 'ban');
		}
		this.channelRepository.save(chan)
			.catch((e) => console.log('Save Channel modifChannel error'));
		return 1;
	}

	async addSanction(chan: ChannelEntity, user: string, sanction: string, seconds: number) {
		let endSanction = new Date(Date.now() + seconds * 1000);
		let userSanc = await this.userService.getByLogin(user);
		if (!userSanc) {
			console.log(`addSanction error: User ${user} not found`)
			return 0;
		}
		const newSanction = this.sanctionRepository
			.create({user: userSanc, type: sanction, chan: chan, end: endSanction});
		console.debug(`user ${sanction} until ${endSanction}`);
		chan.sanctions.push(newSanction);
		return 1;
	}

	async removeSanction(chan: ChannelEntity, user: string, sanction: string) {
		let sanct = chan.sanctions.find(s => s.user.login == user && s.type == sanction);
		if (!sanct) {
			console.log(`removeSanction error: user '${user}' not found in ${sanction}s`);
			return 0;
		}
		this.sanctionRepository.remove(sanct)
		.catch((e) => console.log('Remove sanction removeSanction error'));
		chan.sanctions = chan.sanctions.filter(s => s.user.login != user); 
		await this.channelRepository.save(chan)
			.catch((e) => console.log('Save chan removeSanction error'));
		return 1;
	}

	async checkSanctions(server: Server) {
		const allSanctions = await this.sanctionRepository.find({
			relations: {
				user: true,
				chan : {
					owner: true,
					admins: true,
					users: true,
					sanctions: {
						user: true,
					}
				},
			} 
		});
		const now = new Date();
		const toDelete: SanctionEntity[] = [];
		allSanctions.forEach((sanction) => {
			if (now.getTime() >= sanction.end.getTime())
				toDelete.push(sanction);
		});
		if (toDelete.length) {
			for (let sanction of toDelete) {
				// let requestor = 'time';
				let chanName = sanction.chan.name;
				let userName = sanction.user.login; 
				let type : string; 
				sanction.type == 'ban' ? type = 'restoreBan' : type = 'restoreMute';
				if (sanction.type == 'mute') {
					sanction.chan.users.push(sanction.user);
					sanction.chan.sanctions = sanction.chan.sanctions
						.filter(s => s.user.login != userName);
					this.channelRepository.save(sanction.chan)
						.catch((e) => console.log('Save chan error'));
				}
				await this.sanctionRepository.remove(sanction)
					.catch((e) => console.log('Remove sanction checkSanctions error'));
				for (const user of this.getAllChanUsers(sanction.chan)) {
					let modifChanDto = new ModifChanDto(chanName, type, userName);
					server.to(user.socketId).emit("modifChan", modifChanDto);
				}
			}
		}
	}

	async blockUser(blockerLogin: string, blockedLogin: string) {
		let blocker = await this.userService.getByLogin(blockerLogin, {blockeds: true});
		let blocked = await this.userService.getByLogin(blockedLogin);
		if (!blocked) {
			console.log(`BlockUser error : User '${blockedLogin}' not found`);
			return;
		}
		console.log(`User '${blockerLogin}' block '${blockedLogin}'`);
		blocker.blockeds.push(blocked);
		await this.userRepository.save(blocker)
			.catch((e) => console.log('Save User error'));
		return blocked;
	}

	async unblockUser(blockerLogin: string, blockedLogin: string, server: Server) {
		let blocker = await this.userService.getByLogin(blockerLogin, {blockeds: true});
		let i = blocker.blockeds.findIndex(b => b.login == blockedLogin)
		if (i == -1) {
			console.log(`unblockUser error : User '${blockedLogin}' not found in blocked users`);
			return;
		}
		console.log(`User '${blockerLogin}' unblock '${blockedLogin}'`);
		blocker.blockeds.splice(i, 1);
		await this.userRepository.save(blocker)
			.catch((e) => console.log('Save User error'));
		let priv = await this.getPriv([blockedLogin,blockerLogin]);
		if (!priv)
			server.to(blocker.socketId).emit('userUnblockNoPriv', blockedLogin);
		else {
			let basicUser = (priv.users[0].login == blockerLogin ? 
				new BasicUserDto(priv.users[1].login, priv.users[1].avatar)
				: new BasicUserDto(priv.users[0].login, priv.users[0].avatar))
			let msgs = priv.messages
				.map(m => new MessageDto(m.user.login, m.message, m.createdAt));
			let privDto = new PrivConvDto(basicUser, msgs, priv.readed, priv.id);
			server.to(blocker.socketId).emit('userUnblock', privDto);
		}
	}

	getAllChanUsers(chan: ChannelEntity, bans?: boolean) {
		let allUsers = chan.admins.concat(chan.users)
			.concat(chan.sanctions.filter(s => s.type == 'mute').map(s => s.user));
		if (bans == true)
			allUsers =  allUsers.concat(chan.sanctions
				.filter(s => s.type == 'ban').map(s => s.user));
		if (chan.owner)
			allUsers.push(chan.owner);
		return allUsers;
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
		console.log(`mutes : ${chan.sanctions.filter(s => s.type == 'mute').map(s => `'` + s.user.login + `'`)}`);
		console.log(`bans : ${chan.sanctions.filter(s => s.type == 'ban').map(s => s.user.login + ', ')}`);
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
