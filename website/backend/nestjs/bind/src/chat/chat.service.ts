/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entites/message.entity';
import { PrivateEntity } from './entites/private.entity';
import { ChannelEntity } from './entites/channel.entity';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewPrivMsgDto } from './dto/NewPrivMsgDto';
import BasicUserDto from './dto/BasicUserDto';
import { MessageDto } from './dto/MessageDto';
import { PrivConvDto } from './dto/PrivConvDto';
import { HttpService } from '@nestjs/axios';
import { timeStamp } from 'console';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(MessageEntity)
		private msgRepository: Repository<MessageEntity>,
		@InjectRepository(PrivateEntity)
		private privateRepository: Repository<PrivateEntity>,
		@InjectRepository(PrivateEntity)
		private channelRepository: Repository<ChannelEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private readonly userService: UsersService, // private readonly dataSource: DataSource, // private httpService: HttpService,
	) {}

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

	async createPrivsDto(requestor: string, privs: PrivateEntity[]) {
		const privsDto: PrivConvDto[] = [];
		privs.forEach((priv) => {
			let login: string;
			if (priv.users[0].login == requestor) login = priv.users[1].login;
			else login = priv.users[0].login;
			const user = new BasicUserDto(login);
			const read = priv.readed;
			const msgs: MessageDto[] = [];
			const id = priv.id;
			priv.messages.forEach((msg) =>
				msgs.push(new MessageDto(msg.user.login, msg.message, msg.createdAt)),
			);
			privsDto.push(new PrivConvDto(user, msgs, read, id));
		});
		return privsDto;
	}

	async sortPrivs(privs: PrivateEntity[]) {
		privs.sort(function (x, y) {
			if (
				x.messages[x.messages.length - 1].createdAt.getTime() <
				y.messages[y.messages.length - 1].createdAt.getTime()
			)
				return 1;
			return -1;
		});
	}

	async getServerUsersFiltred(login: string, filter: string) {
		const users = await this.userService.getByLoginFiltred(filter);
		const basicInfos: BasicUserDto[] = [];
		for (let i = 0; i < users.length; i++) {
			if (login != users[i].login)
				basicInfos.push(new BasicUserDto(users[i].login));
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

	// ========================= CHANNELS =========================
}
