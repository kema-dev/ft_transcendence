export class ModifChanDto {
	chan: string;
	psw?: string;
	invitUser?: string;
	promotAdm?: string;
	demotUser?: string;
	ban?: string;
	mute?: string;
	kick?: string;
	avatar?: any;
	constructor(
		chan: string, key: string, value: any
	) {
		this.chan = chan;
		for (const classKey in this)
			if (classKey == key)
				this[classKey] = value;
	}
}
