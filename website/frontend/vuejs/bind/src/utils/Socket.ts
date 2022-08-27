const { io } = require("socket.io-client");

export default class Socket {
	socket: any;
	constructor(path: string) {
		this.socket = io(path);
	}
	send(path: string, props: any) {
		this.socket.emit(path, props);
	}
	on(path: string, fct: any) {
		this.socket.on(path, fct);
	}
	getSocket() {
		return this.socket;
	}
}
