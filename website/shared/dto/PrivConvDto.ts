import { Message } from "../object/Message";

export class PrivateConvDto {
	user: string;
	msgs: Message[];
	avatar: any;
	constructor(user: string, msgs: Message[], avatar: any) {
		this.user = user;
		this.msgs = msgs;
		this.avatar = avatar;
	}
}
