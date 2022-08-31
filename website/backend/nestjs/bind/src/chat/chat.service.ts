import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entites/message.entity';
import { Repository } from 'typeorm';
import { NewPrivMsg } from './dto/NewPrivMsg';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(MessageEntity)
		private msgRepository: Repository<MessageEntity>
	) {}

	async getMessages() : Promise<MessageEntity[]>{
		console.log("getMessages ChatService used")
		return await this.msgRepository.find();
		// return 'get msg';
	}

	async addMessage(data : NewPrivMsg) {
		console.log("AddMesage Chat");
		return await this.msgRepository.save(data);
	}

	
	
}