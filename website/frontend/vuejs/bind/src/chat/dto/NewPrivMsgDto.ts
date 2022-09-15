export class NewPrivMsgDto {
	userSend: string;
	userReceive: string;
	message: string;
	date = new Date();
	constructor(userSend: string, userReceive: string, message: string) {
		this.userSend = userSend;
		this.userReceive = userReceive;
		this.message = message;
	}
}
