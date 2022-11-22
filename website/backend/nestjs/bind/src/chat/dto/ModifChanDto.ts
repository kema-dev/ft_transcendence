export class ModifChanDto {
	// requestor: string;
	chan: string;
	psw?: string;
	priv?: boolean;
	invitUser?: string;
	promotAdm?: string;
	demotUser?: string;
	mute?: string;
	restoreMute?: string;
	ban?: string;
	restoreBan?: string;
	time?: number;
	group?: string;
	kick?: string;
	avatar?: any;
	constructor(
		chan: string, key: string, value: any, group?: string, time?: number
	) {
		// this.requestor = requestor;
		this.chan = chan;
		// for (const classKey in this) {
		// 	console.log(`classkey = ${classKey}, value = ${value}, key = ${key}`)
		// 	if (classKey == key) {
		// 		// console.log(`classkey = ${classKey}, value = ${value}`)
		// 		this[classKey] = value;
		// 	}
		// }
		if(key == 'restoreMute')
			this.restoreMute = value;
		else if(key == 'restoreBan')
			this.restoreBan = value;
		if (time)
			this.time = time;
		if (group)
			this.group = group;
	}
}
