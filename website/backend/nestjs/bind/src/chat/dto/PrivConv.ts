import Message from "./Message"
import BasicUser from './BasicUser';

export class PrivConv {
	user: BasicUser;
	messages: Message[];
	readed: boolean;
	id: number;
	constructor(user: BasicUser, messages: Message[], readed: boolean, id: number) {
		this.user = user;
		this.messages = messages;
		this.readed = readed;
		this.id = id;
	}
}
