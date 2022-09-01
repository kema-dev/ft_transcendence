import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import TimestampEntites from '../../generics/timestamp.enties';
import { User } from '../../users/user.entity';
import { PrivateEntity } from './private.entity';


@Entity("message")
export class MessageEntity extends TimestampEntites{
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ update: false })
	message: string;

	@ManyToOne( type => User, (user) => user.messages)
	@JoinColumn()
	user: User;
	
	@ManyToOne( type => PrivateEntity, (privateEntity) => privateEntity.messages)
	@JoinColumn()
	convers: PrivateEntity;


}

