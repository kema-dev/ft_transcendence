import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from "./entites/message.entity";

@Module({
	imports: [TypeOrmModule.forFeature([MessageEntity])],
	exports:[ChatService],
	providers:[ChatService],
	controllers:[ChatController],
})
export class ChatModule {

}