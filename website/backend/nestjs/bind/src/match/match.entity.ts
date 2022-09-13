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

	@Column()
	public lobby_name: string;
}
