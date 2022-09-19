export class ResumUserDto {
	public constructor(user: any) {
		this.login = user.login;
		this.level = user.level;
		this.avatar = user.avatar;
		this.status = user.status;
		if (!user.status)
			this.status = "offline";
	}
	login: string;
	level: number;
	avatar: string;
	status: string;
}

export default ResumUserDto;
