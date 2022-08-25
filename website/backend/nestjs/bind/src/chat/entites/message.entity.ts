import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import TimestampEntites from 'src/generics/timestamp.enties';
import { User } from 'src/users/user.entity';


@Entity("message")
export class MessageEntity extends TimestampEntites{
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ 
		unique: true,
		update: false
	})
	message: string;

	@ManyToOne( type => User, (user) => user.messages, {
		onDelete: 'CASCADE'
	})
	user: User;

}

