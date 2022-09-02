import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { MessageEntity } from '../chat/entites/message.entity';
import { PrivateEntity } from '../chat/entites/private.entity';
import TimestampEntites from '../generics/timestamp.enties';

@Entity("user")
export class UserEntity extends TimestampEntites{
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

	@Column({nullable: true})
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

	@Column({nullable: true})
	public session_token: string;

	@Column({nullable: true})
	public session_expiration: Date;

	@OneToMany(type => MessageEntity, (message) => message.user ,{
		cascade: true,
		nullable: true
	})
	messages: MessageEntity[];
	
	@ManyToMany(type => PrivateEntity, (priv) => priv.users ,{
		cascade: true,
		nullable: true
	})
	@JoinTable()
	privates: PrivateEntity[];
}
