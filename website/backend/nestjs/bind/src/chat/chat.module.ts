import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
	imports:[],
	exports:[],
	controllers:[ChatController],
	providers:[ChatService]
})
export class ChatModule {

}