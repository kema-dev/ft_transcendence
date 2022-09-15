/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../authentication/auth.guard';
import { ChatService } from './chat.service';
import { BasicUserDto } from './dto/BasicUserDto';

@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	// @UseGuards(AuthGuard)
	@Get('getPrivs/:login')
	async getPrivs(@Param() params: { login: string }) {
		console.log(`getPrivs for user ${params.login}`);
		const privs = await this.chatService.getUserPrivs(params.login);
		await this.chatService.sortPrivs(privs);
		return await this.chatService.createPrivsDto(params.login, privs);
	}

	// @UseGuards(AuthGuard)
	@Get('getServerUsersFiltred/:login/:filter')
	async getServerUsersFiltred(
		@Param() params: { login: string; filter: string },
	) {
		return await this.chatService.getServerUsersFiltred(
			params.login,
			params.filter,
		);
	}

	// @UseGuards(AuthGuard)
	@Post('message')
	postMessage() {
		console.log('Add a message from message list');
		return 'Add Message';
	}

	// @UseGuards(AuthGuard)
	@Delete('message')
	deleteMessage() {
		console.log('Supress a message from message list');
		return 'Delete Message';
	}

	// @UseGuards(AuthGuard)
	@Put('message')
	putMessage() {
		console.log('Modify a message from message list');
		return 'Update Message';
	}
}
