import { UserEntity } from 'src/users/user.entity';

export class ResumUserDto {
	public constructor(user: UserEntity) {
		this.login = user.login;
		this.level = user.level;
		this.avatar = user.avatar;
		this.status = user.status;
	}
	login: string;
	level: number;
	avatar: string;
	status: string;
}

export default ResumUserDto;
