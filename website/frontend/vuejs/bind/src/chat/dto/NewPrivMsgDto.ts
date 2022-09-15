export class NewPrivMsgDto {
	userSend: string;
	userReceive: string;
	message: string;
	date = Date();
	constructor(user1: string, user2: string, message: string) {
		this.userSend = user1;
		this.userReceive = user2;
		this.message = message;
	}
}
