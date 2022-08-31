import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import TimestampEntites from '../../generics/timestamp.enties';
import { User } from '../../users/user.entity';


@Entity("message")
export class MessageEntity extends TimestampEntites{
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ 
		// unique: true,
		update: false
	})
	message: string;

	@ManyToOne( type => User, (user) => user.messages, {
		onDelete: 'CASCADE'
	})
	user: User;

}

