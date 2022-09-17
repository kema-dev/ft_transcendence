import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { MessageEntity } from '../chat/entites/message.entity';
import { PrivateEntity } from '../chat/entites/private.entity';
import { ChannelEntity } from '../chat/entites/channel.entity';
import TimestampEntites from '../utils/timestamp.enties';

@Entity("user")
export class UserEntity extends TimestampEntites{
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
	
	@Column({nullable: true})
	public avatar: string;
	// @Column()
	// public avatar: string;
	
	// @Column()
	// public friends: [User];
	
	@Column({nullable: true})
	socketId: string;

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

	@Column({nullable: true})
	public session_token: string;

	@Column({nullable: true})
	public session_expiration: Date;

// ===================== CHAT =====================

	@OneToMany(type => MessageEntity, (message) => message.user ,{
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	messages: MessageEntity[];
	
	// ======== PRIVS

	@ManyToMany(type => PrivateEntity, (priv) => priv.users ,{
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinTable()
	privates: PrivateEntity[];
	
	// ======== CHANNELS

	@ManyToMany(type => ChannelEntity, (chan) => chan.admins ,{
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinTable()
	chansAdmin: ChannelEntity[];
	
	@ManyToMany(type => ChannelEntity, (chan) => chan.users ,{
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinTable()
	chansUser: ChannelEntity[];
	
	@ManyToMany(type => ChannelEntity, (chan) => chan.bans ,{
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinTable()
	bans: ChannelEntity[];
	
	@ManyToMany(type => ChannelEntity, (chan) => chan.mutes ,{
		cascade: true,
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinTable()
	mutes: ChannelEntity[];
}
