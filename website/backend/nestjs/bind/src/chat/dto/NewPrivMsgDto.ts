export class NewPrivMsgDto {
	userSend: string;
	userReceive: string;
	message: string;
	date = Date();
	constructor(userSend: string, userReceive: string, message: string) {
		this.userSend = userSend;
		this.userReceive = userReceive;
		this.message = message;
	}
}
