/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	OneToMany,
	ManyToOne,
	ManyToMany,
	JoinTable,
	JoinColumn,
} from 'typeorm';
import TimestampEntites from '../../utils/timestamp.enties';
import { MessageEntity } from './message.entity';
import { UserEntity } from '../../users/user.entity';
import { SanctionEntity } from './sanction.entity';

@Entity('channel')
export class ChannelEntity extends TimestampEntites {
	constructor() {
		super();
		// this.readed = false;
		// this.avatar = avatars[Math.floor(Math.random() * 5)];
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

	@ManyToOne((type) => UserEntity, (user) => user.chansOwner, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn()
	owner: UserEntity;

	@ManyToMany( type => UserEntity, (user) => user.chansAdmin, {
		onDelete: 'CASCADE',
		nullable: true, 
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
	
	// @ManyToMany((type) => UserEntity, (user) => user.chansBan, {
	// 	onDelete: 'CASCADE',
	// 	nullable: true,
	// })
	// @JoinTable()
	// bans: UserEntity[];

	// @ManyToMany((type) => UserEntity, (user) => user.chansMute, {
	// 	onDelete: 'CASCADE',
	// 	nullable: true,
	// })
	// @JoinTable()
	// mutes: UserEntity[];
	
	@OneToMany((type) => SanctionEntity, (sanction) => sanction.chan, {
		cascade: true,
		nullable: true,
	})
	sanctions: SanctionEntity[];
	
}
