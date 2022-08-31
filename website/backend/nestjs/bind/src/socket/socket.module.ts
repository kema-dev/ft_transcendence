import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ChatModule } from "../chat/chat.module";
import { SocketEvents } from "./socketEvents";

@Module({
	imports: [ChatModule, UsersModule],
	exports:[],
	controllers:[],
	providers:[SocketEvents]
})
export class SocketModule {}