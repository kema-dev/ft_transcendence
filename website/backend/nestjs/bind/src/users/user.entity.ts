import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { MessageEntity } from '../chat/entites/message.entity';
import { PrivateEntity } from '../chat/entites/private.entity';
import TimestampEntites from '../utils/timestamp.enties';

function toDataURL(url: string, callback: Function) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var reader = new FileReader();
		reader.onloadend = function () {
			callback(reader.result);
		}
		reader.readAsDataURL(xhr.response);
	};
	xhr.open('GET', url);
	xhr.responseType = 'blob';
	xhr.send();
}
@Entity("user")
export class UserEntity extends TimestampEntites {
	constructor() {
		super();
		this.level = 0;
		this.status = "offline";
	}
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ unique: true })
	public email: string;

	@Column({ unique: true })
	public login: string;

	@Column()
	public password: string;

	@Column()
	public level: number;

	@Column({ nullable: true })
	public avatar: string;

	@Column({ nullable: true })
	public status: string;

	@ManyToMany(type => UserEntity, (user) => user.friends, {
		onDelete: 'SET NULL'
	})
	@JoinTable()
	public friends: UserEntity[];

	@ManyToMany(type => UserEntity, (user) => user.requestFriend, {
		onDelete: 'SET NULL'
	})
	@JoinTable()
	public requestFriend: UserEntity[];

	@Column()
	public ft_code: string;

	@Column()
	public ft_accessToken: string;

	@Column()
	public ft_tokenType: string;

	@Column()
	public ft_expiresIn: number;

	@Column()
	public ft_refreshToken: string;

	@Column()
	public ft_scope: string;

	@Column()
	public ft_createdAt: Date;

	@Column()
	public totp_code: string;

	@Column({ nullable: true })
	public session_token: string;

	@Column({ nullable: true })
	public session_expiration: Date;

	@OneToMany(type => MessageEntity, (message) => message.user, {
		cascade: true,
		nullable: true
	})
	messages: MessageEntity[];

	@ManyToMany(type => PrivateEntity, (priv) => priv.users, {
		cascade: true,
		nullable: true
	})
	@JoinTable()
	privates: PrivateEntity[];
}
function getBase64StringFromDataURL(result: string | ArrayBuffer) {
	throw new Error('Function not implemented.');
}

