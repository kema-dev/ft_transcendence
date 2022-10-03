export class ModifChanDto {
	chan: string;
	psw?: string;
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
		chan: string, key: string, value: any, time?: number, group?: string
	) {
		this.chan = chan;
		for (const classKey in this)
			if (classKey == key)
				this[classKey] = value;
		if (time)
			this.time = time;
		if (group)
			this.group = group;
	}
}
