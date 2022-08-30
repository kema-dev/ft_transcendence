import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from "./dto/Message";

@Module({
	imports: [TypeOrmModule.forFeature([Message])],
	exports:[ChatService],
	providers:[ChatService],
	controllers:[ChatController],
})
export class ChatModule {

}