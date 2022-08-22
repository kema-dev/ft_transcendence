import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MessageEntity } from 'src/chat/entites/message.entity';
import TimestampEntites from 'src/generics/timestamp.enties';

@Entity("user")
export class User extends TimestampEntites{
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ unique: true })
	public email: string;

	@Column({ unique: true })
	public login: string;

	@Column()
	public password: string;

	@Column()
	public level: number;

	@Column()
	public avatar: string;

	// @Column()
	// public friends: [User];

	@Column()
	public ft_code: string;

	@Column()
	public ft_accessToken: string;

	@Column()
	public ft_tokenType: string;

	@Column()
	public ft_expiresIn: number;

	@Column()
	public ft_refreshToken: string;

	@Column()
	public ft_scope: string;

	@Column()
	public ft_createdAt: Date;

	@Column()
	public totp_code: string;

	@OneToMany(type => MessageEntity, (message) => message.user ,{
		cascade: true,
		nullable: true
	})
	messages: MessageEntity[];

	// @Column()
	// public test:string;
}
