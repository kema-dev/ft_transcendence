import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ArrayContains } from 'typeorm';
import { MessageEntity } from './entites/message.entity';
import { PrivateEntity } from './entites/private.entity';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewPrivMsgDto } from './dto/NewPrivMsgDto';
import BasicUser from './dto/BasicUserDto';
import { StringSchema } from 'joi';

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
		private readonly dataSource: DataSource,
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
		return await this.getPrivWithUserIds([userId1, userId2]);
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
		const privs = await this.userRepository.findOne({
			relations: {privates : {users: true, messages: true}},
			where: {login: login},
			order: {privates: {updatedAt: 'DESC'}},
			// select: {privates: true}
		});

		// const userId = (await this.userService.getByLogin(login)).id;
		// const privs = await this.privateRepository.findBy({
		// 	users: ArrayContains ([userId])
		// });

		// const privs = await this.privateRepository.createQueryBuilder("private")
		// 	// .leftJoinAndSelect("private.users", "users")
		// 	// .where("users @> :login", {login: [login]})
		// 	// .where("users.login = :login", {login: login})
		// 	// .where("private.id = :id", {id: 2})
		// 	.orderBy("private.updatedAt", "DESC")
		// 	.getMany();

		// const privs = this.privateRepository.

		// let privs = await this.dataSource
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

		// privs.privates.forEach(priv => console.log(`type of date conv = ${priv.updatedAt.constructor.name}`));
		// console.log("privs getUserPrivs = ", privs);
		
		return privs.privates;

	}
	
	async addPrivMsg(data : NewPrivMsgDto) {
		// Find users
		const userSend = await this.userService.getByLogin(data.userSend);
		const userReceive = await this.userService.getByLogin(data.userReceive);
		console.log("addPrivMsg Chat");
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
			priv.updatedAt = msg.createdAt;
			// console.log(`Update priv: ${priv.updatedAt.toLocaleTimeString()}`)
			await this.privateRepository.save(priv).catch(e => console.log("Save priv error"));
			// await this.privateRepository.update(priv, {updatedAt: new Date()});
		}
		// else => Create a new PrivateConv
		else {
			console.log("creation New PrivateConv");
			const newPriv = this.privateRepository.create();
			newPriv.users = [userSend, userReceive];
			newPriv.messages = [msg];
			await this.privateRepository.save(newPriv).catch(e => console.log("Save newPriv error"));
		}
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
		privates.forEach(priv => {
			// console.log(`priv = ${priv}`);
		})
		const priv = privates.find((item) => {
			// console.log(`item.users[0].id = ${item.users[0].id}\n
			// item.users[1].id = ${item.users[1].id}\n
			// userIds[0] = ${userIds[0]}\n
			// userIds[1] = ${userIds[1]}\n`);
			if ((item.users[0].id == userIds[0] && item.users[1].id == userIds[1])
				|| (item.users[0].id == userIds[1] && item.users[1].id == userIds[0]))
				return true;
		});
		// console.log(`priv fin getPrivWithUserIds = ${priv}`);
		return priv;
	}
}