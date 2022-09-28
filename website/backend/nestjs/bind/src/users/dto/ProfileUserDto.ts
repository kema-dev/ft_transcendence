import ResumUserDto from 'src/users/dto/ResumUserDto';
import { UserEntity } from 'src/users/user.entity';

export class ProfileUserDto {
	public constructor(user: UserEntity) {
		this.login = user.login;
		this.level = user.level;
		this.avatar = user.avatar;
		this.status = user.status;
		this.lobby_name = user.lobby_name;
		if (!user.status)
			this.status = "offline";
		this.ratio = user.ratio;
		if (!user.ratio)
			this.ratio = "0.5";
		this.requestFriend = [];
		this.friends = [];
		for (let i in user.friends) {
			this.friends.push(new ResumUserDto(user.friends[i]));
		}
		for (let i in user.requestFriend) {
			this.requestFriend.push(new ResumUserDto(user.requestFriend[i]));
		}
	}
	login: string;
	level: number;
	avatar: string;
	status: string;
	ratio: string;
	requestFriend: ResumUserDto[];
	friends: ResumUserDto[];
	lobby_name: string;
}

export default ProfileUserDto;
