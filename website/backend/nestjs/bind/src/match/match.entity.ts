/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
} from 'typeorm';

@Entity('match')
export class MatchEntity {
	@PrimaryGeneratedColumn()
	public id?: number;

	@CreateDateColumn()
	public creation_date?: Date;

	@Column()
	player_count: number;

	@Column()
	ball_count: number;

	@Column()
	lobby_name: string;

	@Column()
	owner: string;

	@Column({ type: 'simple-array' })
	players: string[];

	@Column({ type: 'simple-array' })
	scores: number[];

	@Column({ type: 'simple-array' })
	ranks: number[];
}
