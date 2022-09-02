import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entites/message.entity';
import { PrivateEntity } from './entites/private.entity';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewPrivMsgDto } from './dto/NewPrivMsgDto';

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

	// async addMessage(data : NewPrivMsg) {
	// 	console.log("AddMesage Chat");
	// 	return await this.msgRepository.save(data);
	// }
	
	async addPrivMsg(data : NewPrivMsgDto) {
		console.log("addPrivMsg Chat");
		// Find and add UsersId to Msg + PrivConv
		const userSend = await this.userService.getByLogin(data.userSend);
		const userReceive = await this.userService.getByLogin(data.userReceive);
		// Create and save Msg
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
			priv.messages.push(msg);
			await this.privateRepository.save(priv).catch(e => console.log("Save priv error"));
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