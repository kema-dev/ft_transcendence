/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	OneToMany,
	ManyToMany,
	JoinTable,
	JoinColumn,
} from 'typeorm';
import TimestampEntites from '../../utils/timestamp.enties';
import { MessageEntity } from './message.entity';
import { UserEntity } from '../../users/user.entity';

@Entity('channel')
export class ChannelEntity extends TimestampEntites {
	constructor() {
		super();
		this.readed = true;
		// this.avatar = avatars[Math.floor(Math.random() * 5)];

		// this.messages = [];
		// this.users = [];
		// this.bans = [];
		// this.mutes = [];
	}
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	private: boolean;

	@Column({ nullable: true })
	avatar: string;

	@Column({ nullable: true })
	password: string;

	@Column()
	readed: boolean;

	@ManyToMany( type => UserEntity, (user) => user.chansAdmin, {
		onDelete: 'CASCADE'
	})
	@JoinTable()
	admins: UserEntity[];

	@ManyToMany((type) => UserEntity, (user) => user.chansUser, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinTable()
	users: UserEntity[];

	@OneToMany((type) => MessageEntity, (message) => message.chan, {
		cascade: true,
		nullable: true,
	})
	messages: MessageEntity[];

	@ManyToMany((type) => UserEntity, (user) => user.chansBan, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinTable()
	bans: UserEntity[];

	@ManyToMany((type) => UserEntity, (user) => user.chansMute, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinTable()
	mutes: UserEntity[];
}
