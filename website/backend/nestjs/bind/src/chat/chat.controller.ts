/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UseGuards,
	Body,
} from '@nestjs/common';
import { AuthGuard } from '../authentication/auth.guard';
import { ChatService } from './chat.service';
import { NewChanDto } from './dto/NewChanDto';

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

	@Get('getChans/:login')
	async getChans(@Param() params : {login: string}) {
		console.log(`getChans for user ${params.login }`);
		const chans = await this.chatService.getUserChans(params.login);
		// await this.chatService.printChans(chans);
		if (chans.length) {
			await this.chatService.sortChans(chans);
		}
		// await this.chatService.printChans(chans);
		return await this.chatService.createChansDto(params.login, chans);
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
	@Get('getServerChansFiltred/:login/:filter')
	async getServerChansFiltred(
		@Param() params: { login: string; filter: string },
	) {
		return await this.chatService.getServerChansFiltred(
			params.login,
			params.filter,
		);
	}

	// @UseGuards(AuthGuard)
	@Post('CreateChan')
	async createChan( @Body() data: NewChanDto) {
		return await this.chatService.createNewChan(data);
	}

	// @UseGuards(AuthGuard)
	@Post('JoinChannel')
	async joinChannel(
		@Body() data: {requestor: string, chanName: string, psw: string | undefined}
	) {
		// if (data.psw)
		// 	await this.chatService.checkChanPsw(data.chanName, data.psw);
		return await this.chatService.joinChannel(data);
	}


	// // @UseGuards(AuthGuard)
	// @Post('message')
	// postMessage() {
	// 	console.log('Add a message from message list');
	// 	return 'Add Message';
	// }

	// // @UseGuards(AuthGuard)
	// @Delete('message')
	// deleteMessage() {
	// 	console.log('Supress a message from message list');
	// 	return 'Delete Message';
	// }

	// // @UseGuards(AuthGuard)
	// @Put('message')
	// putMessage() {
	// 	console.log('Modify a message from message list');
	// 	return 'Update Message';
	// }
}
