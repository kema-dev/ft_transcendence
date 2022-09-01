import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import TimestampEntites from '../../generics/timestamp.enties';
import { MessageEntity } from './message.entity';
import { User } from '../../users/user.entity';


@Entity("private")
export class PrivateEntity extends TimestampEntites{
	@PrimaryGeneratedColumn()
	id: number;

	// @Column({ update: false })
	// user1: User;
	@ManyToOne( type => User, (user) => user.privates, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	users: [User, User];

	// @Column({ update: false })
	// user2: User;

	@OneToMany( type => MessageEntity, (message) => message.convers)
	messages: MessageEntity[];

}
