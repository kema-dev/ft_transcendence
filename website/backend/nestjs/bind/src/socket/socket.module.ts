import { Module } from "@nestjs/common";
// import { ChatController } from "./socket.controller";
import { SocketEvents } from "./socketEvents";

@Module({
	imports: [],
	exports:[],
	controllers:[],
	providers:[SocketEvents]
})
export class SocketModule {}