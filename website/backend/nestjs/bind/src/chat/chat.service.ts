import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
	constructor() {}

	public async getMessage() {
		console.log("getMessage ChatService used")
		return "Get Message";
	}
	
}