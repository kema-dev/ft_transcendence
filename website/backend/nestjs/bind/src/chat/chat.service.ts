import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ArrayContains } from 'typeorm';
import { MessageEntity } from './entites/message.entity';
import { PrivateEntity } from './entites/private.entity';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewPrivMsgDto } from './dto/NewPrivMsgDto';
// import { PrivMsgDto as NewPrivMsgDto } from '../../../../../shared/dto/PrivMsgDto'
import BasicUser from './dto/BasicUserDto';
import { HttpService } from '@nestjs/axios';
import { timeStamp } from 'console';


@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(MessageEntity)
		private msgRepository: Repository<MessageEntity>,
		@InjectRepository(PrivateEntity)
		private privateRepository: Repository<PrivateEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private readonly userService: UsersService,
		// private readonly dataSource: DataSource,
		// private httpService: HttpService,
	) {}

	// async getMessages() {
	// 	console.log("getMessages ChatService used")
	// 	return await this.msgRepository.find();
	// 	// return 'get msg';
	// }
	
	// async getPrivConvs() {
	// 	console.log("getPrivConvs Chat");
	// 	return await this.privateRepository.find({relations: ['users', 'messages']});
	// }

	

	async getPrivMsg(login1: string, login2: string) {
		const userId1 = (await this.userService.getByLogin(login1)).id;
		const userId2 = (await this.userService.getByLogin(login2)).id;
		// console.log(`user1  = ${login1}, id= ${userId1}\nuser2  = ${login2}, id= ${userId2}`);
		let priv = await this.getPrivWithUserIds([userId1, userId2]);
		if (priv && login1 != priv.messages[priv.messages.length - 1].user.login) {
			priv.readed = true;
			await this.privateRepository.save(priv)
				.catch(e => console.log("Save private getPrivMsg error"));
		}
		return priv;
		// const priv =  await this.getPrivWithUserIds([userId1, userId2]);
		// console.log(priv);
		// return priv;
	}

	async getUsersByLoginFiltred(login: string, filter: string) {
		const users = await this.userService.getByLoginFiltred(filter);
    let basicInfos : BasicUser[] = [];
    for(let i = 0; i < users.length; i++) {
      if (login != users[i].login)
        basicInfos.push(new BasicUser(users[i].login));
    }
		return basicInfos;
	}

	async getUserPrivs(login: string) {
		const user = await this.userRepository.findOne({
			relations: {privates : {users: true, messages: {user: true}}},
			where: {login: login},
			// order: {privates: {updatedAt: 'DESC'}},
			order: {
				privates: {
					messages: {
						createdAt: 'ASC',
					} 
				}
			}
	});

		// const userId = (await this.userService.getByLogin(login)).id;
		// const user = await this.privateRepository.findBy({
		// 	users: ArrayContains ([userId])
		// });

		// const user = await this.privateRepository.createQueryBuilder("private")
		// 	// .leftJoinAndSelect("private.users", "users")
		// 	// .where("users @> :login", {login: [login]})
		// 	// .where("users.login = :login", {login: login})
		// 	// .where("private.id = :id", {id: 2})
		// 	.orderBy("private.updatedAt", "DESC")
		// 	.getMany();

		// const user = this.privateRepository.

		// let user = await this.dataSource
		// 	.createQueryBuilder()
		// 	// .select("private")
		// 	// .from(PrivateEntity, "private")
		// 	.select("user")
		// 	.from(UserEntity, "user")
		// 	.where("user.login = :login", {login: login})
		// 	.leftJoin("user.privates", "privates")
		// 	// .leftJoinAndMapMany("user.privates", "user.privates", "privates")
		// 	// .select("privates")
		// 	.getMany();

		// user.privates.forEach(priv => console.log(`type of date conv = ${priv.updatedAt.constructor.name}`));
		// console.log("user getUserPrivs = ", user);
		
		return user.privates;

	}
	
	async addPrivMsg(data : NewPrivMsgDto) {
		console.log(`addPrivMsg Chatservice, msg = '${data.message}'`);
		// Find users
		const userSend = await this.userService.getByLogin(data.userSend);
		const userReceive = await this.userService.getByLogin(data.userReceive);
		// Create and save Msg
		const msg = this.msgRepository.create({user: userSend, message: data.message});
		await this.msgRepository.save(msg).catch(e => console.log("Save msg error"));
		// Check if PrivConv exist
		const priv = await this.getPrivWithUserIds([userSend.id, userReceive.id]);
		// If PrivateConv exist => add message to the existing one
		if (priv) {
			// console.log("Add msg in PrivateConv which already exist");
			// console.log("priv = ", priv);
			priv.messages.push(msg);
			// priv.updatedAt = msg.createdAt;
			priv.readed = false;
			// console.log(`Update priv: ${priv.updatedAt.toLocaleTimeString()}`)
			await this.privateRepository.save(priv).catch(e => console.log("Save priv error"));
			return priv;
			// await this.privateRepository.update(priv, {updatedAt: new Date()});
		}
		// else => Create a new PrivateConv
		else {
			console.log("creation New PrivateConv");
			const newPriv = this.privateRepository.create();
			newPriv.users = [userSend, userReceive];
			newPriv.messages = [msg];
			newPriv.readed = false;
			await this.privateRepository.save(newPriv).catch(e => console.log("Save newPriv error"));
			return newPriv;
		}
	}

	async markPrivReaded(priv : PrivateEntity) {
		priv.readed = true;
		this.privateRepository.save(priv);
		return priv;
	}


	// ========================= UTILS =========================
	
	async getPrivWithUserIds(userIds: [number, number]) {
		// const userId1 = (await this.userService.getByLogin(userIds[0])).id;
		// const userId2 = (await this.userService.getByLogin(userIds[1])).id;
		const privates = await this.privateRepository.find({
			relations: {
				users: true,
				messages: {
					user: true,
				}
			},
			order: {
				messages : {
					createdAt: 'ASC',
				}
			}
		});
		// privates.forEach(priv => {
		// 	// console.log(`priv = ${priv}`);
		// })
		const priv = privates.find((item) => {
			// console.log(`item.users[0].id = ${item.users[0].id}\n
			// item.users[1].id = ${item.users[1].id}\n
			// userIds[0] = ${userIds[0]}\n
			// userIds[1] = ${userIds[1]}\n`);
			if ((item.users[0].id == userIds[0] && item.users[1].id == userIds[1])
				|| (item.users[0].id == userIds[1] && item.users[1].id == userIds[0]))
				return true;
		});
		return priv;
		// if (priv) 
		// 	return priv;
		// else {
		// 	console.log('getPrivWithUserIds failed, priv not found');
		// 	throw new HttpException('E_PRIV_WITH_USERID_NFIND', HttpStatus.NOT_FOUND)
		// }
	}

	async printPriv(priv: PrivateEntity) {
		console.log(`Priv info :\nusers = ${priv.users[0].login}, ${priv.users[1].login}`);
		console.log("msgs :");
		priv.messages.forEach(msg => {
			console.log(`${msg.message}, created at ${msg.createdAt.toLocaleTimeString("fr")}}`)
		})
	}

	async printPrivs(privs: PrivateEntity[]) {
		privs.forEach(async (priv) => {
			await this.printPriv(priv);
		});
	}
}