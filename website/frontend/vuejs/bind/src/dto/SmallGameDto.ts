import { RacketDto } from './RacketDto';
import { BallDto } from './BallDto';

export class SmallGameDto {
	start: boolean;
	balls: Array<BallDto>;
	rackets: RacketDto[];
	profiles: {
		score: number,
		red: boolean
	}[];
	constructor() {
		this.start = false;
		this.balls = [];
		this.rackets = [];
		this.profiles = [];
	}
}
