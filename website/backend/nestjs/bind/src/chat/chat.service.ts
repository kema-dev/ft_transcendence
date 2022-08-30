import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entites/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(MessageEntity)
		private msgRepository: Repository<MessageEntity>
	) {}

	public async getMessage() {
		console.log("getMessage ChatService used")
		// return await this.msgRepository.find();
		return 'get msg';
	}

	
	
}