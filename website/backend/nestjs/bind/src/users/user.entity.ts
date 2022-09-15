import { Socket } from 'socket.io';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { MessageEntity } from '../chat/entites/message.entity';
import { PrivateEntity } from '../chat/entites/private.entity';
import TimestampEntites from '../utils/timestamp.enties';
import { avatars } from 'src/users/avatars';

@Entity("user")
export class UserEntity extends TimestampEntites {
	constructor() {
		super();
		this.level = 0;
		this.nbrGame = 0;
		this.ratio = "0.5";
		this.status = "offline";
		this.avatar = avatars[Math.floor(Math.random() * 5)];
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

	@Column({ nullable: true })
	public nbrGame: number;

	@Column({ nullable: true })
	public ratio: string;

	@ManyToMany(type => UserEntity, (user) => user.friends, {
		onDelete: 'SET NULL'
	})
	@JoinTable()
	public friends: UserEntity[];

	@ManyToMany(type => UserEntity, {
		onDelete: 'SET NULL'
	})
	@JoinTable()
	public requestFriend: UserEntity[];

	@Column()
	public ft_code: string;

	@Column({ nullable: true })
	socketId: string;

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

