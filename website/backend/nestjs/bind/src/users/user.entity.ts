import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ unique: true })
	public email: string;

	@Column()
	public name: string;

	@Column()
	public password: string;

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
}

export default User;
