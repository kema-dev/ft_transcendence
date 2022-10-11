import { MessageDto } from './MessageDto';
import { BasicUserDto } from './BasicUserDto';

export class PrivConvDto {
	user: BasicUserDto;
	messages: MessageDto[];
	readed: boolean;
	id: number;
	constructor(
		user: BasicUserDto,
		messages: MessageDto[],
		readed: boolean,
		id: number,
	) {
		this.user = user;
		this.messages = messages;
		this.readed = readed;
		this.id = id;
	}
}
