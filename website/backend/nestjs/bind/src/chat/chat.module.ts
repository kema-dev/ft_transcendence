import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { UserEntity } from "../users/user.entity";
import { MessageEntity } from "./entites/message.entity";
import { PrivateEntity } from "./entites/private.entity";
import { UsersService } from "../users/users.service";
import { ChannelEntity } from "./entites/channel.entity";

@Module({
	imports: [TypeOrmModule.forFeature(
		[UserEntity, ChannelEntity, PrivateEntity, MessageEntity]
	)],
	exports:[ChatService],
	providers:[ChatService, UsersService],
	controllers:[ChatController],
})
export class ChatModule {}