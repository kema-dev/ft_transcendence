import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { string } from 'joi';
import { ChatService } from './chat.service';
import BasicUser from './dto/BasicUser';
import { Message, PrivateConvDto } from './dto/PrivateConvDto';
import PrivateTabDto from './dto/PrivateTabDto';
import { PrivConv } from './dto/PrivConv';


@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) { }

	@Get('getPrivs/:login')
	async getPrivs(@Param() params: { login: string }) {
		console.log(`getPrivs for user ${params.login}`);
		const privs = await this.chatService.getUserPrivs(params.login);
		// await this.chatService.printPrivs(privs);
		privs.sort(function (x, y) {
			if (x.messages[x.messages.length - 1].createdAt.getTime()
				< y.messages[y.messages.length - 1].createdAt.getTime())
				return 1;
			return -1;
		});
		// await this.chatService.printPrivs(privs);
		let privsDto: PrivConv[] = [];
		privs.forEach(priv => {
			let login: string;
			if (priv.users[0].login == params.login)
				login = priv.users[1].login;
			else
				login = priv.users[0].login;
			let user = new BasicUser(login);
			let read = priv.readed;
			let msgs: Message[] = [];
			let id = priv.id;
			priv.messages.forEach((msg) => msgs.push(new Message(msg.user.login, msg.message, msg.createdAt)))
			privsDto.push(new PrivConv(user, msgs, read, id));
			// let msg = priv.messages[priv.messages.length - 1].message;
			// let lastMsgUser = priv.messages[priv.messages.length - 1].user.login;
			// let date = priv.messages[priv.messages.length - 1].createdAt;
			// privsTabDto.push(new PrivConv(login, msg, date, lastMsgUser, read));
		});
		return privsDto;
		// privsTabDto.forEach(priv => console.log(`priv =
		// 	login = ${priv.login}
		// 	message = ${priv.message}
		// 	date = ${priv.date}
		// 	lastMsgUser = ${priv.lastMsgUser}
		// 	readed = ${priv.readed}
		// `));
		// privs.forEach(priv => console.log(`priv = ${priv.messages}`));
		// return privsTabDto;
	}

	@Get('getUsersByLoginFiltred/:login/:filter')
	async getUserFiltred(@Param() params: { login: string, filter: string }) {
		return await this.chatService.
			getUsersByLoginFiltred(params.login, params.filter);
	}

	@Get('getPriv/:user1/:user2')
	async getPrivMsg(@Param() params: { user1: string, user2: string }) {
		const priv = await this.chatService.getPrivMsg(params.user1, params.user2);
		if (priv) {
			const messages: Message[] = [];
			priv.messages.forEach(msg => {
				messages.push(new Message(msg.user.login, msg.message, msg.createdAt));
			});
			return new PrivateConvDto(params.user2, messages);
		}
		else
			return new PrivateConvDto(params.user2, []);
		// const ret = new PrivateConvDto(params.user2, messages);
		// console.log("ret = ", ret);
		// return ret;
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
