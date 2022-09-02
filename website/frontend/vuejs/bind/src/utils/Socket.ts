import { io } from "socket.io-client"

export default class Socket {
	socket: any;
	constructor(path: string) {
		this.socket = io(path);
	}
	send(path: string, props: any): any {
		return this.socket.emit(path, props);
	}
	on(path: string, fct: any) {
		this.socket.on(path, fct);
	}
	off(path: string) {
		this.socket.off(path);
	}
	getSocket() {
		return this.socket;
	}
}
