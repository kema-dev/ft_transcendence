/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	OneToMany,
	ManyToMany,
	JoinColumn,
} from 'typeorm';
import TimestampEntites from '../../utils/timestamp.enties';
import { MessageEntity } from './message.entity';
import { UserEntity } from '../../users/user.entity';

@Entity('private')
export class PrivateEntity extends TimestampEntites {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	readed: boolean;

	@ManyToMany((type) => UserEntity, (user) => user.privates, {
		onDelete: 'CASCADE',
	})
	users: [UserEntity, UserEntity];

	@OneToMany((type) => MessageEntity, (message) => message.priv, {
		cascade: true,
	})
	messages: MessageEntity[];
}
