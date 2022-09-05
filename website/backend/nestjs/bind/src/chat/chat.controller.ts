import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { string } from 'joi';
import { ChatService } from './chat.service';
import PrivateTabDto from './dto/PrivateTabDto';


@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService){}

	@Get('message') 
	getMessage() {
		console.log("Get message list");
		// return "Get Message";
		return this.chatService.getMessages();
	}

	@Get('getUserPrivs/:login')
	async getUserPrivs(@Param() params : {login: string}) {
		console.log("getUserPrivs for user \'" + params.login + "\'");
		const privs = await this.chatService.getUserPrivs(params.login);
		let privsTabDto : PrivateTabDto[] = [];
		privs.forEach(priv => {
			let login: string;
			if (priv.users[0].login == params.login)
				login = priv.users[1].login;
			else
				login = priv.users[0].login;
			let msg = priv.messages[priv.messages.length - 1].message;
			// let date = priv.messages[priv.messages.length - 1].createdAt;
			let date = priv.updatedAt;
			privsTabDto.push(new PrivateTabDto(login, msg, date));
		});
		// console.log(privsTabDto);
		// privsTabDto.forEach(priv => console.log(`priv = ${priv.date.constructor.name}`));
		// privs.forEach(priv => console.log(`priv = ${priv.messages}`));
		return privsTabDto;
	}

	@Get('getUsersByLoginFiltred/:login/:filter')
	async getUserFiltred(@Param() params : {login: string, filter: string}) {
		return await this.chatService.
			getUsersByLoginFiltred(params.login, params.filter);
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