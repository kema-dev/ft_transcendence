/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ChatService } from './chat.service';
import { BasicUserDto } from './dto/BasicUserDto';

@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Get('getPrivs/:login')
	async getPrivs(@Param() params: { login: string }) {
		console.log(`getPrivs for user ${params.login}`);
		const privs = await this.chatService.getUserPrivs(params.login);
		await this.chatService.sortPrivs(privs);
		return await this.chatService.createPrivsDto(params.login, privs);
	}

	@Get('getServerUsersFiltred/:login/:filter')
	async getServerUsersFiltred(
		@Param() params: { login: string; filter: string },
	) {
		return await this.chatService.getServerUsersFiltred(
			params.login,
			params.filter,
		);
	}

	@Post('message')
	postMessage() {
		console.log('Add a message from message list');
		return 'Add Message';
	}

	@Delete('message')
	deleteMessage() {
		console.log('Supress a message from message list');
		return 'Delete Message';
	}

	@Put('message')
	putMessage() {
		console.log('Modify a message from message list');
		return 'Update Message';
	}
}
