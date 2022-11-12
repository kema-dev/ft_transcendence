/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	OneToMany,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { MessageEntity } from '../chat/entites/message.entity';
import { PrivateEntity } from '../chat/entites/private.entity';
import { ChannelEntity } from '../chat/entites/channel.entity';
import TimestampEntites from '../utils/timestamp.enties';
import { avatars } from 'src/users/avatars';
import { SanctionEntity } from 'src/chat/entites/sanction.entity';

@Entity("user")
export class UserEntity extends TimestampEntites {
	constructor() {
		super();
		this.level = 1;
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

	@Column("integer", { default: 0 })
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

	@ManyToMany(type => UserEntity, {
		onDelete: 'SET NULL'
	})
	@JoinTable()
	public blockeds: UserEntity[];

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

	@Column()
	public tmp_totp_code: string;

	@Column({ nullable: true })
	public session_token: string;

	@Column({ nullable: true })
	public session_expiration: Date;

	@OneToMany(type => MessageEntity, (message) => message.user, {
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	messages: MessageEntity[];

	@ManyToMany(type => PrivateEntity, (priv) => priv.users, {
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinTable()
	privates: PrivateEntity[];

	@OneToMany((type) => ChannelEntity, (chan) => chan.owner, {
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	chansOwner: ChannelEntity[];

	@ManyToMany((type) => ChannelEntity, (chan) => chan.admins, {
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	chansAdmin: ChannelEntity[];

	@ManyToMany(type => ChannelEntity, (chan) => chan.users ,{
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	chansUser: ChannelEntity[];

	// @ManyToMany((type) => ChannelEntity, (chan) => chan.bans, {
	// 	cascade: true,
	// 	nullable: true,
	// 	onDelete: 'SET NULL',
	// })
	// chansBan: ChannelEntity[];

	// @ManyToMany((type) => ChannelEntity, (chan) => chan.mutes, {
	// 	cascade: true,
	// 	nullable: true,
	// 	onDelete: 'SET NULL',
	// })
	// chansMute: ChannelEntity[];

	@OneToMany(type => SanctionEntity, (sanction) => sanction.user, {
		cascade: true,
		nullable: true,
		// onDelete: 'SET NULL',
	})
	sanctions: SanctionEntity[];

	@Column()
	public lobby_name: string;

	@Column({ type: 'simple-array' })
	public match: number[];
}
