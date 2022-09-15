import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinColumn } from 'typeorm';
import TimestampEntites from '../../utils/timestamp.enties';
import { MessageEntity } from './message.entity';
import { UserEntity } from '../../users/user.entity';


@Entity("channel")
export class ChannelEntity extends TimestampEntites{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	// @Column({ nullable: true })
	// avatar: any;

	@Column({ nullable: true })
	password: string;

	@Column()
	readed: boolean;

	@ManyToMany( type => UserEntity, (user) => user.chanAdmins, {
		onDelete: 'SET NULL'
	})
	admins: UserEntity[];

	@ManyToMany( type => UserEntity, (user) => user.chansUser, {
		onDelete: 'SET NULL'
	})
	users: UserEntity[];

	@OneToMany( type => MessageEntity, (message) => message.chan, {
		cascade: true,
	})
	messages: MessageEntity[];

	@ManyToMany( type => UserEntity, (user) => user.bans, {
		onDelete: 'SET NULL'
	})
	bans: UserEntity[];

	@ManyToMany( type => UserEntity, (user) => user.mutes, {
		onDelete: 'SET NULL'
	})
	mutes: UserEntity[];

}
