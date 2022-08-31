import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from './dto/Message'

@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService){}

	@Get('message') 
	getMessage() {
		console.log("Get message list");
		// return "Get Message";
		return this.chatService.getMessages();
	}

	@Post('message')
	postMessage() {
		console.log("Add a message from message list")
		return 'Add Message';
	}

	@Delete('message')
	deleteMessage() {
		console.log("Supress a message from message list")
		return 'Delete Message';
	}

	@Put('message')
	putMessage() {
		console.log("Modify a message from message list")
		return 'Update Message';
	}
}