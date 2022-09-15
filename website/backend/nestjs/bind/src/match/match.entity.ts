import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('match')
export class MatchEntity {
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column()
	public nbrPlayer: number;

	@Column()
	public nbrBall: number;

	@Column({ type: 'simple-array' })
	public players: Array<string>;

	@Column()
	public start: boolean;

	@Column({ unique: true })
	public lobby_name: string;

	@Column()
	public open: boolean;

	@Column()
	public owner: string;
}
