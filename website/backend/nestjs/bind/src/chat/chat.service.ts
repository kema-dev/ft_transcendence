import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ArrayContains } from 'typeorm';
import { MessageEntity } from './entites/message.entity';
import { PrivateEntity } from './entites/private.entity';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewPrivMsgDto } from './dto/NewPrivMsgDto';
import BasicUser from './dto/BasicUserDto';

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

	async getMessages() {
		console.log("getMessages ChatService used")
		return await this.msgRepository.find();
		// return 'get msg';
	}
	
	async getPrivConvs() {
		console.log("getPrivConvs Chat");
		return await this.privateRepository.find({relations: ['users', 'messages']});
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
		console.log("addPrivMsg Chat");
		// Find and add UsersId to Msg + PrivConv
		const userSend = await this.userService.getByLogin(data.userSend);
		const userReceive = await this.userService.getByLogin(data.userReceive);
		// console.log(`usersend = ${userSend.login}, userReveive = ${userReceive.login}`);
		// Create and save Msg
		// const msg = new MessageEntity()
		const msg = this.msgRepository.create({user: userSend, message: data.message});
		await this.msgRepository.save(msg).catch(e => console.log("Save msg error"));
		// Check if PrivConv exist
		const privates = await this.privateRepository.find( {relations: ['users', 'messages']});
		const priv = privates.find((item) => 
			(item.users[0].id == userSend.id && item.users[1].id == userReceive.id)
			|| (item.users[1].id == userSend.id && item.users[0].id == userReceive.id)
		)
		// If PrivateConv exist => add message to the existing one
		if (priv) {
			console.log("Add msg in PrivateConv which already exist");
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

	
	
}