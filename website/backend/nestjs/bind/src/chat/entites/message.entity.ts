import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import TimestampEntites from '../../utils/timestamp.enties';
import { UserEntity } from '../../users/user.entity';
import { PrivateEntity } from './private.entity';


@Entity("message")
export class MessageEntity extends TimestampEntites{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	message: string;

	@ManyToOne( type => UserEntity, (user) => user.messages)
	@JoinColumn()
	user: UserEntity;
	
	@ManyToOne( type => PrivateEntity, (privateEntity) => privateEntity.messages)
	@JoinColumn()
	convers: PrivateEntity;
}

