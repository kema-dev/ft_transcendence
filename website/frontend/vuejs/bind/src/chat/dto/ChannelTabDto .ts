export class ChannelTabDto {
	name: string;
	nbUsers: number;
	avatar: any;
	psw: boolean;
	ban?: Date;
	// constructor(name: string, nbUsers: number, avatar: any, psw?: string, ban?: Date) {
	constructor(name: string, nbUsers: number, psw: boolean, ban?: Date) {
		this.name = name;
		this.nbUsers = nbUsers;
		// this.avatar = avatar;
		this.psw = psw;
		if (ban) this.ban = ban;
	}
}
