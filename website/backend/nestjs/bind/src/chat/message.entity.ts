import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import TimestampEntites from 'src/generics/timestamp.enties';


@Entity()
export default class Message extends TimestampEntites{
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ 
		unique: true,
		update: false
	})
	message: string;


}

