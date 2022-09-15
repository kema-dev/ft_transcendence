/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import TimestampEntites from '../../utils/timestamp.enties';
import { UserEntity } from '../../users/user.entity';
import { PrivateEntity } from './private.entity';
import { ChannelEntity } from './channel.entity';

@Entity('message')
export class MessageEntity extends TimestampEntites {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	message: string;

	@ManyToOne((type) => UserEntity, (user) => user.messages)
	@JoinColumn()
	user: UserEntity;

	@ManyToOne((type) => PrivateEntity, (priv) => priv.messages, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn()
	priv: PrivateEntity;

	@ManyToOne((type) => ChannelEntity, (chan) => chan.messages, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn()
	chan: ChannelEntity;
}
