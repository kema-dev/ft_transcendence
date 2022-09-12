import { Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../authentication/auth.guard';

@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@UseGuards(AuthGuard)
	@Get('message')
	getMessage() {
		console.log('Get message list');
		// return "Get Message";
		return this.chatService.getMessages();
	}

	@UseGuards(AuthGuard)
	@Post('message')
	postMessage() {
		console.log('Add a message from message list');
		return 'Add Message';
	}

	@UseGuards(AuthGuard)
	@Delete('message')
	deleteMessage() {
		console.log('Supress a message from message list');
		return 'Delete Message';
	}

	@UseGuards(AuthGuard)
	@Put('message')
	putMessage() {
		console.log('Modify a message from message list');
		return 'Update Message';
	}
}
